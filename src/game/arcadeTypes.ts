/**
 * The contract every embedded game implements.
 *
 * React owns *which* game is on screen and what the buttons say. The game owns
 * everything that happens between frames. The two meet here and nowhere else:
 * React calls the lifecycle methods, the game pushes state back through
 * `onState`. No gameplay state lives on the DOM node, and no game rule lives
 * inside a `useEffect`.
 */

export type GameStatus = 'ready' | 'playing' | 'paused' | 'won' | 'lost' | 'result';

/** True whenever the run is over, whichever way it ended. */
export function isOver(status: GameStatus): boolean {
  return status === 'won' || status === 'lost' || status === 'result';
}

/** One HUD reading. Games publish these; the React chrome renders them. */
export interface Readout {
  /** Short uppercase key, e.g. SCORE. */
  label: string;
  value: string;
  /** Tints the value. `live` is the pale teal system colour. */
  tone?: 'default' | 'accent' | 'live';
}

/**
 * Everything React needs to draw the chrome around a game. Games emit a whole
 * snapshot rather than diffs — these are small objects a handful of times a
 * second, and whole-snapshot means React can never show a stale half-state.
 */
export interface GameState {
  status: GameStatus;
  readouts: Readout[];
  /** Headline on the end-of-run overlay, e.g. WIN or TRY AGAIN. */
  resultTitle?: string;
  /** One line under the headline. */
  resultDetail?: string;
  /** Colours the overlay. */
  resultTone?: 'win' | 'near' | 'loss';
}

export type StateListener = (state: GameState) => void;

export interface GameContext {
  /** Logical width. Not device pixels — the renderer handles the scale. */
  width: number;
  height: number;
  /** Set when the visitor asked for less motion. Trails and shake come off. */
  reducedMotion: boolean;
}

export interface EmbeddedGame {
  /** Human name, used in the canvas aria-label. */
  readonly title: string;
  /** One line telling the player what to do. Shown on the ready overlay. */
  readonly objective: string;
  /** Control hints, shown under the stage. */
  readonly controls: string;
  /**
   * False for games where pausing is meaningless — a reaction timer cannot be
   * paused without becoming a different game. The host hides the control.
   */
  readonly pausable: boolean;

  mount(canvas: HTMLCanvasElement): void;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  destroy(): void;

  /** Pointer and touch, already scoped to the canvas by the host. */
  handlePointer(event: PointerEvent): void;
  /** Return true when the key was consumed, so the host can stop the page scrolling. */
  handleKey(event: KeyboardEvent, down: boolean): boolean;

  subscribe(listener: StateListener): () => void;
  getState(): GameState;

  /** Whether the visitor wants reduced motion. May change while mounted. */
  setReducedMotion(reduced: boolean): void;

  /**
   * Clears whatever the game counts across runs — a streak, an attempt count.
   * Only implemented where there is something to clear; the host checks.
   */
  resetBest?(): void;
}
