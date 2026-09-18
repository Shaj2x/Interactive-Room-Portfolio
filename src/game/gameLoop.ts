import type {
  EmbeddedGame,
  GameContext,
  GameState,
  GameStatus,
  StateListener,
} from './arcadeTypes';

/**
 * Fixed physics step. Everything that moves advances in 1/120s increments no
 * matter what the display does, so a 144Hz monitor and a throttled background
 * tab produce the same game. Rendering still happens once per frame.
 */
const STEP = 1 / 120;

/**
 * Most frames we can catch up on in one go. Past this we drop the backlog
 * rather than freezing the tab trying to simulate it — a tab that was hidden
 * for a minute should resume, not fast-forward.
 */
const MAX_STEPS = 6;

/**
 * Canvas sizing that survives device pixel ratio, resizing, and zoom.
 *
 * The bitmap is sized in device pixels and the context is pre-scaled, so games
 * only ever think in CSS pixels. `width`/`height` are therefore stable logical
 * units: changing DPR changes the bitmap, never the coordinates a game sees.
 */
export class CanvasSurface {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  width = 0;
  height = 0;
  private observer: ResizeObserver | null = null;
  private onResize: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.measure();
  }

  /** Re-measures and re-scales. Safe to call every frame; it no-ops if nothing moved. */
  measure(): boolean {
    const rect = this.canvas.getBoundingClientRect();
    // A display:none ancestor reports 0x0. Keep the last good size instead of
    // collapsing the world to nothing and having to rebuild it on the way back.
    const cssW = Math.max(1, Math.round(rect.width || this.width || 1));
    const cssH = Math.max(1, Math.round(rect.height || this.height || 1));
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const bmpW = Math.round(cssW * dpr);
    const bmpH = Math.round(cssH * dpr);

    const changed = this.width !== cssW || this.height !== cssH;
    if (this.canvas.width !== bmpW || this.canvas.height !== bmpH) {
      this.canvas.width = bmpW;
      this.canvas.height = bmpH;
    }
    this.width = cssW;
    this.height = cssH;
    // setTransform, not scale: this runs after every resize and must not compound.
    this.ctx.setTransform(bmpW / cssW, 0, 0, bmpH / cssH, 0, 0);
    return changed;
  }

  watch(onResize: () => void): void {
    this.onResize = onResize;
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => this.handleResize());
      this.observer.observe(this.canvas);
    } else {
      window.addEventListener('resize', this.handleResize);
    }
  }

  private handleResize = (): void => {
    if (this.measure()) this.onResize?.();
  };

  /** Converts a pointer event into logical canvas coordinates. */
  toLocal(event: { clientX: number; clientY: number }): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / (rect.width || 1)) * this.width,
      y: ((event.clientY - rect.top) / (rect.height || 1)) * this.height,
    };
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    window.removeEventListener('resize', this.handleResize);
    this.onResize = null;
  }
}

/**
 * Shared machinery for every game: the loop, the canvas, the status field and
 * the subscription list. Subclasses supply rules and pixels only.
 *
 * Deliberately a class rather than hooks. A game is a long-lived object with
 * mutable state advanced sixty times a second; modelling that as React state
 * means re-rendering the tree sixty times a second to move a ball.
 */
export abstract class BaseGame implements EmbeddedGame {
  abstract readonly title: string;
  abstract readonly objective: string;
  abstract readonly controls: string;
  readonly pausable: boolean = true;

  protected surface: CanvasSurface | null = null;
  protected status: GameStatus = 'ready';
  protected reducedMotion = false;
  /** Seconds since the current run started. Frozen while paused. */
  protected elapsed = 0;

  private frame = 0;
  private last = 0;
  private accumulator = 0;
  private listeners = new Set<StateListener>();
  private cached: GameState | null = null;

  /* ------------------------------------------------- subclass hooks */

  /** Put the world back to its opening position. Called on mount and on reset. */
  protected abstract onReset(ctx: GameContext): void;
  /** Advance by exactly `dt` seconds. Only called while playing. */
  protected abstract onUpdate(dt: number, ctx: GameContext): void;
  /** Draw the current world. Called while playing, paused, ready and finished. */
  protected abstract onRender(ctx: CanvasRenderingContext2D, view: GameContext): void;
  /** Build the snapshot React renders as the HUD and overlay. */
  protected abstract buildState(): GameState;

  /** Called when the canvas changed size, after the world has been re-measured. */
  protected onResize(_ctx: GameContext): void {}

  /* ------------------------------------------------------ lifecycle */

  mount(canvas: HTMLCanvasElement): void {
    // Guard against StrictMode's double mount: drop the first surface cleanly
    // rather than ending up with two loops drawing to one canvas.
    if (this.surface) this.teardown();
    this.surface = new CanvasSurface(canvas);
    this.surface.watch(() => {
      if (!this.surface) return;
      this.onResize(this.context());
      this.draw();
    });
    this.onReset(this.context());
    this.status = 'ready';
    this.publish();
    // Paint immediately. A canvas must never be blank while it waits to start.
    this.draw();
    this.run();
  }

  start(): void {
    if (this.status === 'playing') return;
    if (this.status !== 'paused') {
      this.onReset(this.context());
      this.elapsed = 0;
    }
    this.accumulator = 0;
    this.last = performance.now();
    this.status = 'playing';
    this.publish();
  }

  pause(): void {
    if (this.status !== 'playing') return;
    this.status = 'paused';
    this.publish();
  }

  resume(): void {
    if (this.status !== 'paused') return;
    this.last = performance.now();
    this.accumulator = 0;
    this.status = 'playing';
    this.publish();
  }

  reset(): void {
    this.onReset(this.context());
    this.elapsed = 0;
    this.status = 'ready';
    this.publish();
    this.draw();
  }

  destroy(): void {
    this.teardown();
    this.listeners.clear();
  }

  private teardown(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.surface?.destroy();
    this.surface = null;
  }

  /* ----------------------------------------------------------- loop */

  private run(): void {
    const tick = (now: number): void => {
      this.frame = requestAnimationFrame(tick);
      // A tab that was backgrounded hands back a huge delta. Clamp it so the
      // world resumes where it was instead of teleporting.
      const delta = Math.min((now - this.last) / 1000, 0.25);
      this.last = now;

      if (this.status === 'playing') {
        this.accumulator += delta;
        let steps = 0;
        while (this.accumulator >= STEP && steps < MAX_STEPS) {
          this.elapsed += STEP;
          this.onUpdate(STEP, this.context());
          this.accumulator -= STEP;
          steps += 1;
          // A rule may have ended the run mid-catch-up; stop simulating it.
          if (this.status !== 'playing') break;
        }
        if (steps >= MAX_STEPS) this.accumulator = 0;
      }

      this.draw();
    };
    this.last = performance.now();
    this.frame = requestAnimationFrame(tick);
  }

  protected draw(): void {
    if (!this.surface) return;
    const view = this.context();
    const { ctx } = this.surface;
    ctx.save();
    ctx.clearRect(0, 0, view.width, view.height);
    this.onRender(ctx, view);
    ctx.restore();
  }

  protected context(): GameContext {
    return {
      width: this.surface?.width ?? 0,
      height: this.surface?.height ?? 0,
      reducedMotion: this.reducedMotion,
    };
  }

  /* ---------------------------------------------------------- state */

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  getState(): GameState {
    if (!this.cached) this.cached = this.buildState();
    return this.cached;
  }

  /** Recomputes the snapshot and notifies React. Call after any visible change. */
  protected publish(): void {
    this.cached = this.buildState();
    for (const listener of this.listeners) listener(this.cached);
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  /* ----------------------------------------------------------- input */

  handlePointer(_event: PointerEvent): void {}
  handleKey(_event: KeyboardEvent, _down: boolean): boolean {
    return false;
  }

  /** Ends the run. `tone` picks the overlay colour. */
  protected finish(status: Extract<GameStatus, 'won' | 'lost' | 'result'>): void {
    this.status = status;
    this.publish();
  }
}

export interface Letterbox {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Fits a fixed logical playfield inside the available canvas, centred, without
 * distorting it.
 *
 * Games that need stable geometry (a Pong court, a Snake grid) are authored
 * against constant logical dimensions and mapped through this. Resizing the
 * window then changes how big the court looks and nothing about how it plays.
 */
export function letterbox(
  view: { width: number; height: number },
  logicalW: number,
  logicalH: number,
): Letterbox {
  const scale = Math.min(view.width / logicalW, view.height / logicalH);
  return {
    scale,
    offsetX: (view.width - logicalW * scale) / 2,
    offsetY: (view.height - logicalH * scale) / 2,
  };
}
