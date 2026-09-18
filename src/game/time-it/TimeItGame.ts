import type { GameContext, GameState } from '../arcadeTypes';
import { BaseGame } from '../gameLoop';
import { isActionKey } from '../input';
import { getBest, submitScore } from '../scoreStore';
import { renderTimeIt } from './timeItRenderer';

/**
 * The dial is centred and sized from the smaller edge, so this game has no
 * playfield of its own — it only asks for a stage that is wider than it is tall.
 */
export const ASPECT = 1.5;

/** Targets land on quarter seconds between these bounds, inclusive. */
const MIN_TARGET = 2;
const MAX_TARGET = 6;
const INCREMENT = 0.25;

export type Band = 'perfect' | 'sharp' | 'close' | 'missed';

/** Upper bound of the absolute error, in seconds, for each band. */
export const BANDS: Array<{ band: Band; within: number; label: string }> = [
  { band: 'perfect', within: 0.05, label: 'PERFECT' },
  { band: 'sharp', within: 0.15, label: 'SHARP' },
  { band: 'close', within: 0.3, label: 'CLOSE' },
  { band: 'missed', within: Infinity, label: 'MISSED' },
];

export interface TimeItResult {
  stopped: number;
  delta: number;
  band: Band;
  label: string;
}

export interface TimeItWorld {
  target: number;
  /** Seconds since the run started. Only meaningful while playing. */
  running: number;
  result: TimeItResult | null;
  streak: number;
  bestStreak: number;
  attempts: number;
  /**
   * Seconds per full revolution of the sweep. Re-rolled every run so the
   * sweep cannot be counted as a clock — it shows that time is passing
   * without showing how much.
   */
  sweepPeriod: number;
  /** 0..1 reveal animation on the result. */
  reveal: number;
}

export class TimeItGame extends BaseGame {
  readonly title = 'Quarter Second';
  readonly objective = 'Stop the clock on the target. Targets sit on quarter seconds.';
  readonly controls = 'Space or Enter · click · tap';
  /** A reaction timer you can pause is not a reaction timer. */
  readonly pausable = false;

  private world: TimeItWorld = TimeItGame.emptyWorld();
  /**
   * The run is timed against `performance.now()` rather than the fixed-step
   * accumulator. A keypress is handled the instant it arrives, so timing it
   * against a stepped clock would quantise the result to 8ms — a quarter of
   * the Perfect band.
   */
  private startedAt = 0;

  private static emptyWorld(): TimeItWorld {
    return {
      target: TimeItGame.rollTarget(),
      running: 0,
      result: null,
      streak: 0,
      bestStreak: 0,
      attempts: 0,
      sweepPeriod: 4,
      reveal: 0,
    };
  }

  private static rollTarget(): number {
    const steps = Math.round((MAX_TARGET - MIN_TARGET) / INCREMENT);
    return MIN_TARGET + Math.floor(Math.random() * (steps + 1)) * INCREMENT;
  }

  /* ---------------------------------------------------------- lifecycle */

  /**
   * Rolls a fresh target and a fresh sweep speed. All of it lives here rather
   * than in `start`, because `BaseGame.start` calls `onReset` itself — doing
   * the work in both places meant the second reset wiped the first.
   */
  protected onReset(): void {
    // The streak and the attempt count survive a reset: they belong to the
    // sitting, not the single run.
    const { streak, bestStreak, attempts } = this.world;
    this.world = TimeItGame.emptyWorld();
    this.world.sweepPeriod = 3.1 + Math.random() * 2.2;
    this.world.streak = streak;
    this.world.bestStreak = bestStreak;
    this.world.attempts = attempts;
    this.startedAt = 0;
  }

  start(): void {
    // Restarting mid-run has to genuinely restart. Dropping back to `ready`
    // first guarantees the base class runs `onReset` instead of returning
    // early on an already-playing game.
    this.status = 'ready';
    super.start();
    this.startedAt = performance.now();
  }

  protected onUpdate(dt: number): void {
    if (this.startedAt > 0) this.world.running = (performance.now() - this.startedAt) / 1000;
    // A run nobody stops has to end, or the page animates forever.
    if (this.world.running > MAX_TARGET + 6) this.stopTimer();
    void dt;
  }

  /* -------------------------------------------------------------- rules */

  /** Freezes the clock and grades it. The only way out of `playing`. */
  private stopTimer(): void {
    if (this.status !== 'playing') return;
    const stopped = (performance.now() - this.startedAt) / 1000;
    const w = this.world;
    const delta = stopped - w.target;
    const magnitude = Math.abs(delta);
    const entry = BANDS.find((b) => magnitude <= b.within) ?? BANDS[BANDS.length - 1];

    w.running = stopped;
    w.result = { stopped, delta, band: entry.band, label: entry.label };
    w.attempts += 1;

    if (entry.band === 'perfect' || entry.band === 'sharp') {
      w.streak += 1;
      w.bestStreak = Math.max(w.bestStreak, w.streak);
    } else {
      w.streak = 0;
    }

    // The session best is the smallest error, so lower wins here.
    submitScore('time-it', Number(magnitude.toFixed(3)));
    this.finish('result');
  }

  /** Clears the stored best without disturbing the current run. */
  resetBest(): void {
    this.world.bestStreak = 0;
    this.world.streak = 0;
    this.world.attempts = 0;
    this.publish();
  }

  /* -------------------------------------------------------------- input */

  handleKey(event: KeyboardEvent, down: boolean): boolean {
    if (!isActionKey(event.key)) return false;
    if (!down) return true;
    if (this.status === 'playing') this.stopTimer();
    else this.start();
    return true;
  }

  handlePointer(event: PointerEvent): void {
    if (event.type !== 'pointerdown') return;
    if (this.status === 'playing') this.stopTimer();
    else this.start();
  }

  /* ------------------------------------------------------ presentation */

  protected onRender(ctx: CanvasRenderingContext2D, view: GameContext): void {
    // The reveal is driven here rather than in update, because the result
    // state does not tick — but it still has to animate into place.
    if (this.world.result) {
      const speed = view.reducedMotion ? 1 : 0.09;
      this.world.reveal = Math.min(1, this.world.reveal + speed);
    }
    renderTimeIt(ctx, view, this.world, this.status);
  }

  protected buildState(): GameState {
    const w = this.world;
    const best = getBest('time-it');
    const state: GameState = {
      status: this.status,
      readouts: [
        { label: 'TARGET', value: `${w.target.toFixed(2)}s`, tone: 'live' },
        { label: 'STREAK', value: String(w.streak), tone: w.streak > 0 ? 'accent' : 'default' },
        { label: 'BEST', value: best === undefined ? '—' : `±${best.toFixed(2)}s` },
        { label: 'RUNS', value: String(w.attempts) },
      ],
    };

    if (w.result && this.status === 'result') {
      const { delta, band, label, stopped } = w.result;
      const sign = delta >= 0 ? 'late' : 'early';
      state.resultTitle = label;
      state.resultDetail = `${stopped.toFixed(2)}s against ${w.target.toFixed(2)}s — ${Math.abs(
        delta,
      ).toFixed(2)}s ${sign}.`;
      state.resultTone = band === 'perfect' ? 'win' : band === 'sharp' || band === 'close' ? 'near' : 'loss';
    }
    return state;
  }
}
