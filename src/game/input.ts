import type { EmbeddedGame } from './arcadeTypes';

/**
 * Centralised input. Every game receives Pointer Events (one code path for
 * mouse, pen and touch) and keyboard events through here, and every listener
 * added here is removed by the returned disposer.
 */

/** Keys the arcade claims. While a game is live these must not scroll the page. */
const CLAIMED = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  ' ',
  'Spacebar',
  'Enter',
  'w',
  'a',
  's',
  'd',
]);

export type Direction = 'up' | 'down' | 'left' | 'right';

/** Maps both key layouts games accept onto one direction, or null. */
export function keyDirection(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'up';
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'down';
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'left';
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'right';
    default:
      return null;
  }
}

/** True for the keys that mean "do the thing" — flap, stop the clock, serve. */
export function isActionKey(key: string): boolean {
  return key === ' ' || key === 'Spacebar' || key === 'Enter';
}

export interface InputOptions {
  /** Looked up per event so swapping games never leaves a stale reference. */
  getGame: () => EmbeddedGame | null;
  /** Called on any input, so the host can retire "press start" hints. */
  onInteract?: () => void;
}

/**
 * Wires a canvas up to whichever game is currently mounted.
 *
 * Keyboard is listened for on `window` rather than the canvas, because a
 * canvas only receives key events while focused and players expect to press an
 * arrow key the moment a game is on screen. To stay polite it ignores events
 * aimed at a text field, and only swallows a key the game says it used.
 */
export function attachInput(canvas: HTMLCanvasElement, options: InputOptions): () => void {
  const { getGame, onInteract } = options;

  const pointer = (event: PointerEvent): void => {
    const game = getGame();
    if (!game) return;
    onInteract?.();
    game.handlePointer(event);
  };

  const down = (event: PointerEvent): void => {
    // Capture keeps a drag alive when the finger leaves the canvas, and means
    // we always get the matching pointerup.
    if (event.pointerType !== 'mouse') {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        /* Capture is a nicety; a browser refusing it must not break input. */
      }
    }
    // Stop touch-drags from scrolling the section behind the stage.
    if (event.pointerType === 'touch') event.preventDefault();
    pointer(event);
  };

  const key = (event: KeyboardEvent, isDown: boolean): void => {
    const target = event.target as HTMLElement | null;
    // Never steal typing, and never steal Enter/Space from a focused control.
    if (target) {
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
        return;
      }
      if (isActionKey(event.key) && (tag === 'BUTTON' || tag === 'A')) return;
    }
    const game = getGame();
    if (!game) return;
    if (isDown) onInteract?.();
    const consumed = game.handleKey(event, isDown);
    // A running game owns the arrow keys and space whether or not it acts on
    // them: pressing Left in Updraft must not scroll the section out from
    // under the stage. Once the game is idle the page gets them back, so a
    // visitor can still arrow-scroll the page around a finished game.
    const status = game.getState().status;
    const live = status === 'playing' || status === 'paused';
    if ((consumed || live) && CLAIMED.has(event.key)) event.preventDefault();
  };

  const keyDown = (event: KeyboardEvent): void => key(event, true);
  const keyUp = (event: KeyboardEvent): void => key(event, false);

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', pointer);
  canvas.addEventListener('pointerup', pointer);
  canvas.addEventListener('pointercancel', pointer);
  canvas.addEventListener('pointerleave', pointer);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);

  return () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', pointer);
    canvas.removeEventListener('pointerup', pointer);
    canvas.removeEventListener('pointercancel', pointer);
    canvas.removeEventListener('pointerleave', pointer);
    window.removeEventListener('keydown', keyDown);
    window.removeEventListener('keyup', keyUp);
  };
}

/**
 * Turns a pointer drag into a single direction. Used by Snake, where a swipe
 * should mean one turn rather than a stream of them.
 */
export class SwipeTracker {
  private startX = 0;
  private startY = 0;
  private active = false;
  /** Shorter than this and it was a tap, not a swipe. */
  constructor(private readonly threshold = 24) {}

  begin(x: number, y: number): void {
    this.startX = x;
    this.startY = y;
    this.active = true;
  }

  /** Returns a direction once per swipe, then re-anchors for the next one. */
  move(x: number, y: number): Direction | null {
    if (!this.active) return null;
    const dx = x - this.startX;
    const dy = y - this.startY;
    if (Math.abs(dx) < this.threshold && Math.abs(dy) < this.threshold) return null;
    this.startX = x;
    this.startY = y;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  end(): void {
    this.active = false;
  }

  get isActive(): boolean {
    return this.active;
  }
}
