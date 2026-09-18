import type { GameContext, GameState } from '../arcadeTypes';
import { BaseGame } from '../gameLoop';
import { isActionKey, keyDirection, SwipeTracker, type Direction } from '../input';
import { PALETTE, spawnBurst, stepParticles, type Particle } from '../palette';
import { getBest, submitScore } from '../scoreStore';
import { CELL, GRID_H, GRID_W, type Cell } from './constants';
import { renderSnake } from './snakeRenderer';

const START_LENGTH = 4;
/** Seconds per cell at the start. */
const BASE_TICK = 0.15;
const MIN_TICK = 0.062;
/** Every this many nodes the snake speeds up. */
const NODES_PER_SPEEDUP = 5;
const SPEEDUP_FACTOR = 0.9;
/**
 * Self-collision is ignored for this long after the start. Without it a player
 * who was already holding a key when the run began could die on frame one.
 */
const GRACE = 1.2;
const POINTS_PER_NODE = 10;

const VECTORS: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export interface SnakeWorld {
  /** Head first. Grid coordinates. */
  cells: Cell[];
  /** Where each segment was on the previous tick, for smooth interpolation. */
  previous: Cell[];
  direction: Direction;
  food: Cell;
  /** 0..1 through the current tick. Drives the interpolation. */
  tickProgress: number;
  /** Counts up forever; drives the food's pulse. */
  clock: number;
  /** Fades after a node is eaten. */
  eatFlash: number;
  nodes: number;
  score: number;
  particles: Particle[];
  grace: number;
  /** Whether the finished run beat the previous best. Decided before it is stored. */
  record: boolean;
}

export class SnakeGame extends BaseGame {
  readonly title = 'Signal Snake';
  readonly objective = 'Collect signal nodes. The edges wrap; your own tail does not.';
  readonly controls = '↑ ↓ ← → or WASD · swipe on touch';

  private world: SnakeWorld = SnakeGame.emptyWorld();
  private tickTimer = 0;
  private tickInterval = BASE_TICK;
  /**
   * Turns are queued, not applied immediately. Pressing up-then-left inside a
   * single tick should make both turns on consecutive ticks rather than
   * throwing the first one away.
   */
  private queue: Direction[] = [];
  private swipe = new SwipeTracker(26);

  private static emptyWorld(): SnakeWorld {
    const startX = Math.floor(GRID_W / 3);
    const startY = Math.floor(GRID_H / 2);
    const cells: Cell[] = [];
    for (let i = 0; i < START_LENGTH; i += 1) cells.push({ x: startX - i, y: startY });
    return {
      cells,
      previous: cells.map((c) => ({ ...c })),
      direction: 'right',
      food: { x: startX + 8, y: startY },
      tickProgress: 0,
      clock: 0,
      eatFlash: 0,
      nodes: 0,
      score: 0,
      particles: [],
      grace: GRACE,
      record: false,
    };
  }

  /* ---------------------------------------------------------- lifecycle */

  protected onReset(): void {
    this.world = SnakeGame.emptyWorld();
    this.world.food = this.pickFood();
    this.tickTimer = 0;
    this.tickInterval = BASE_TICK;
    this.queue = [];
    this.swipe.end();
  }

  protected onUpdate(dt: number): void {
    const w = this.world;
    w.clock += dt;
    w.grace = Math.max(0, w.grace - dt);
    w.eatFlash = Math.max(0, w.eatFlash - dt * 3);
    stepParticles(w.particles, dt, 2.4);

    this.tickTimer += dt;
    while (this.tickTimer >= this.tickInterval) {
      this.tickTimer -= this.tickInterval;
      this.step();
      if (this.status !== 'playing') return;
    }
    w.tickProgress = this.tickTimer / this.tickInterval;
  }

  /* -------------------------------------------------------------- rules */

  private step(): void {
    const w = this.world;

    const next = this.queue.shift();
    // A turn straight back into the neck is a request to die by accident.
    if (next && next !== OPPOSITE[w.direction]) w.direction = next;

    w.previous = w.cells.map((c) => ({ ...c }));

    const v = VECTORS[w.direction];
    // Wrapping: the modulo keeps the head on the board rather than ending the run.
    const head: Cell = {
      x: (w.cells[0].x + v.x + GRID_W) % GRID_W,
      y: (w.cells[0].y + v.y + GRID_H) % GRID_H,
    };

    const ate = head.x === w.food.x && head.y === w.food.y;

    // The tail cell vacates on this same tick, so moving into it is legal —
    // check collision against the body that will still be there.
    const body = ate ? w.cells : w.cells.slice(0, -1);
    if (w.grace <= 0 && body.some((c) => c.x === head.x && c.y === head.y)) {
      this.die();
      return;
    }

    w.cells.unshift(head);
    if (ate) {
      w.nodes += 1;
      w.score += POINTS_PER_NODE;
      w.eatFlash = 1;
      if (!this.reducedMotion) {
        spawnBurst(
          w.particles,
          head.x * CELL + CELL / 2,
          head.y * CELL + CELL / 2,
          10,
          PALETTE.teal,
          120,
        );
      }
      w.food = this.pickFood();
      const level = Math.floor(w.nodes / NODES_PER_SPEEDUP);
      this.tickInterval = Math.max(MIN_TICK, BASE_TICK * SPEEDUP_FACTOR ** level);
      this.publish();
    } else {
      w.cells.pop();
    }
    w.tickProgress = 0;
  }

  /**
   * Picks a free cell uniformly. Enumerating the free cells rather than
   * rejection-sampling means a nearly-full board still terminates.
   */
  private pickFood(): Cell {
    const w = this.world;
    const taken = new Set(w.cells.map((c) => c.y * GRID_W + c.x));
    const free: number[] = [];
    for (let i = 0; i < GRID_W * GRID_H; i += 1) if (!taken.has(i)) free.push(i);
    if (free.length === 0) return { ...w.cells[0] };
    const pick = free[Math.floor(Math.random() * free.length)];
    return { x: pick % GRID_W, y: Math.floor(pick / GRID_W) };
  }

  private die(): void {
    const w = this.world;
    if (!this.reducedMotion) {
      spawnBurst(
        w.particles,
        w.cells[0].x * CELL + CELL / 2,
        w.cells[0].y * CELL + CELL / 2,
        16,
        PALETTE.amber,
        170,
      );
    }
    // Compare against the previous best before this run is stored.
    const previous = getBest('snake');
    w.record = w.score > 0 && (previous === undefined || w.score > previous);
    submitScore('snake', w.score);
    this.finish('lost');
  }

  /* -------------------------------------------------------------- input */

  private turn(direction: Direction): void {
    // Two queued turns is enough for a genuine double-tap and few enough that
    // a mashed keyboard cannot steer the snake seconds into the future.
    const last = this.queue.length > 0 ? this.queue[this.queue.length - 1] : this.world.direction;
    if (direction === last || direction === OPPOSITE[last]) return;
    if (this.queue.length >= 2) this.queue.shift();
    this.queue.push(direction);
  }

  handleKey(event: KeyboardEvent, down: boolean): boolean {
    if (!down) return keyDirection(event.key) !== null || isActionKey(event.key);

    if (isActionKey(event.key)) {
      if (this.status === 'ready') this.start();
      else if (this.status === 'paused') this.resume();
      else if (this.status === 'playing') this.pause();
      return true;
    }

    const direction = keyDirection(event.key);
    if (!direction) return false;
    if (this.status === 'ready') this.start();
    if (this.status === 'playing') this.turn(direction);
    return true;
  }

  handlePointer(event: PointerEvent): void {
    if (!this.surface) return;
    const local = this.surface.toLocal(event);

    if (event.type === 'pointerdown') {
      this.swipe.begin(local.x, local.y);
      if (this.status === 'ready') this.start();
      else if (this.status === 'paused') this.resume();
      return;
    }
    if (event.type === 'pointermove') {
      const direction = this.swipe.move(local.x, local.y);
      if (direction && this.status === 'playing') this.turn(direction);
      return;
    }
    this.swipe.end();
  }

  /* ------------------------------------------------------ presentation */

  protected onRender(ctx: CanvasRenderingContext2D, view: GameContext): void {
    renderSnake(ctx, view, this.world, this.status);
  }

  protected buildState(): GameState {
    const w = this.world;
    const level = Math.floor(w.nodes / NODES_PER_SPEEDUP) + 1;
    const best = getBest('snake');

    const state: GameState = {
      status: this.status,
      readouts: [
        { label: 'SCORE', value: String(w.score), tone: 'accent' },
        { label: 'LENGTH', value: String(w.cells.length) },
        { label: 'SPEED', value: `×${level}`, tone: 'live' },
        { label: 'BEST', value: best === undefined ? '—' : String(best) },
      ],
    };

    if (this.status === 'lost') {
      const record = w.record;
      state.resultTitle = record ? 'BEST YET' : 'SIGNAL LOST';
      state.resultDetail = `${w.nodes} node${w.nodes === 1 ? '' : 's'}, length ${w.cells.length}.`;
      state.resultTone = record ? 'win' : w.nodes >= 10 ? 'near' : 'loss';
    }
    return state;
  }
}
