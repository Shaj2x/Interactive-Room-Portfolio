import type { GameContext, GameState } from '../arcadeTypes';
import { BaseGame } from '../gameLoop';
import { isActionKey } from '../input';
import { PALETTE, spawnBurst, stepParticles, type Particle } from '../palette';
import { getBest, submitScore } from '../scoreStore';
import {
  DRAFT_LIFT,
  DRAFT_W,
  FLAP_COOLDOWN,
  FLAP_VY,
  FORWARD_SPEED,
  GAP_MARGIN,
  GAP_MIN,
  GAP_START,
  GRAVITY,
  GROUND_Y,
  MAX_FALL,
  MAX_GAP_STEP,
  PILLAR_W,
  PLAYER_HALF,
  PLAYER_SIZE,
  PLAYER_X,
  RAMP_OVER,
  SPACING_MIN,
  SPACING_START,
  TRAIL_LIFE,
  VIEW_H,
  WORLD_W,
  type Draft,
  type Mote,
  type Pillar,
} from './constants';
import { renderUpdraft } from './updraftRenderer';

/** How far past the left edge something is kept before it is swept up. */
const CULL_MARGIN = 160;

/**
 * Tilt, in radians, at full climb and at terminal velocity.
 *
 * The mark banks with its flight the way Flappy Bird's bird does, and for the
 * same reason: vertical speed is the one thing the player has to read and the
 * position alone does not show it. Nose-down is the steeper of the two because
 * a fall is the state worth panicking about.
 */
const TILT_UP = -0.42;
const TILT_DOWN = 1.05;

/** How far apart wake samples are taken. How long they last is in constants. */
const TRAIL_STEP = 0.028;

export interface UpdraftWorld {
  /** The player holds `PLAYER_X`; only its height and velocity move. */
  playerY: number;
  vy: number;
  pillars: Pillar[];
  motes: Mote[];
  drafts: Draft[];
  particles: Particle[];
  flapCooldown: number;
  /** Cleared pillars. This is the score. */
  score: number;
  motesTaken: number;
  /** Radians. Eased toward the velocity's tilt rather than snapped to it. */
  tilt: number;
  /** Wing beat, 1 to 0, driving the flap squash. */
  beat: number;
  /** Set while the player is inside an updraft, for the lift and the HUD. */
  inDraft: boolean;
  /**
   * The wake. Only heights are stored: the player never moves across the lane,
   * so where a sample *was* is its height plus however far the air has carried
   * it since, which is what `age` is for.
   */
  trail: Array<{ y: number; age: number }>;
  clock: number;
  /** Whether the finished run beat the previous best. Decided before it is stored. */
  record: boolean;
  /** What ended the run, for the overlay's wording. */
  cause: 'pillar' | 'ground' | null;
}

export class UpdraftGame extends BaseGame {
  readonly title = 'Updraft';
  readonly objective = 'One tap is one flap. Fly the gaps; ride the drafts.';
  readonly controls = 'Space or ↑ · click · tap';

  private world: UpdraftWorld = freshWorld();
  /** World x of the last pillar placed. Generation continues from here. */
  private lastPillarX = 0;
  /** Gap centre of the last pillar placed, so the next one stays near it. */
  private lastGapY = GROUND_Y / 2;
  /** Pillars generated since the run began, which is what the ramp reads. */
  private generated = 0;
  private flapHeld = false;

  /* ---------------------------------------------------------- lifecycle */

  protected onReset(): void {
    this.world = freshWorld();
    this.lastPillarX = PLAYER_X + 340;
    this.lastGapY = GROUND_Y / 2;
    this.generated = 0;
    this.flapHeld = false;
    this.generateAhead();
  }

  protected onUpdate(dt: number): void {
    const w = this.world;
    w.clock += dt;
    w.flapCooldown = Math.max(0, w.flapCooldown - dt);
    w.beat = Math.max(0, w.beat - dt * 4.5);
    stepParticles(w.particles, dt, 1.1);

    this.scrollRoute(dt);
    this.applyGravity(dt);
    this.easeTilt(dt);

    this.stepTrail(dt);

    this.scorePassed();
    this.collectMotes();
    this.decay(dt);
    this.generateAhead();
    this.cull();

    this.checkCollision();
  }

  /**
   * Ages the wake and adds to it on a clock of its own.
   *
   * Sampling every physics step put 12 points inside a tenth of a second, all
   * at nearly the same height, and the trail read as a chain of beads rather
   * than as a path. At `TRAIL_STEP` apart the samples span far enough to show
   * the arc the flap actually flew.
   */
  private stepTrail(dt: number): void {
    const w = this.world;
    if (this.reducedMotion) {
      w.trail.length = 0;
      return;
    }
    for (const point of w.trail) point.age += dt;
    while (w.trail.length && w.trail[0].age > TRAIL_LIFE) w.trail.shift();
    const newest = w.trail[w.trail.length - 1];
    if (!newest || newest.age >= TRAIL_STEP) w.trail.push({ y: w.playerY, age: 0 });
  }

  /* -------------------------------------------------------------- rules */

  /** The player holds still and the world comes to them. */
  private scrollRoute(dt: number): void {
    const travel = FORWARD_SPEED * dt;
    const w = this.world;
    for (const pillar of w.pillars) pillar.x -= travel;
    for (const mote of w.motes) mote.x -= travel;
    for (const draft of w.drafts) draft.x -= travel;
    // The generator's write head lives in the same moving frame as everything
    // else. Leaving it still is what made the route stop: it stayed past the
    // right edge for ever, `generateAhead` saw nothing left to do, and after
    // the opening handful of pillars the lane was empty all the way out.
    this.lastPillarX -= travel;
  }

  private applyGravity(dt: number): void {
    const w = this.world;
    w.inDraft = w.drafts.some((d) => PLAYER_X >= d.x && PLAYER_X <= d.x + d.w);
    const accel = GRAVITY - (w.inDraft ? DRAFT_LIFT : 0);
    w.vy = Math.min(MAX_FALL, w.vy + accel * dt);
    w.playerY += w.vy * dt;

    // The ceiling is a wall, not a kill. Dying to the top of the screen is the
    // one death in this genre that never reads as the player's fault, and
    // stopping there costs the player the height they were trying to gain
    // anyway.
    const ceiling = PLAYER_HALF;
    if (w.playerY < ceiling) {
      w.playerY = ceiling;
      if (w.vy < 0) w.vy = 0;
    }
  }

  private easeTilt(dt: number): void {
    const w = this.world;
    const t = w.vy < 0 ? w.vy / FLAP_VY : w.vy / MAX_FALL;
    const wanted = w.vy < 0 ? TILT_UP * Math.min(1, t) : TILT_DOWN * Math.min(1, t);
    // Nose-up snaps, nose-down drops away slowly: the flap should register the
    // instant it is pressed, and the fall should feel like it is building.
    const rate = wanted < w.tilt ? 18 : 5.5;
    w.tilt += (wanted - w.tilt) * Math.min(1, dt * rate);
  }

  private scorePassed(): void {
    const w = this.world;
    for (const pillar of w.pillars) {
      if (pillar.passed || pillar.x + PILLAR_W > PLAYER_X) continue;
      pillar.passed = true;
      pillar.flash = 1;
      w.score += 1;
      if (!this.reducedMotion) {
        spawnBurst(w.particles, pillar.x + PILLAR_W, pillar.gapY, 6, PALETTE.teal, 110);
      }
      this.publish();
    }
  }

  private collectMotes(): void {
    const w = this.world;
    for (const mote of w.motes) {
      if (mote.taken) continue;
      if (Math.abs(mote.x - PLAYER_X) > 24) continue;
      if (Math.abs(mote.y - w.playerY) > 24) continue;
      mote.taken = true;
      mote.pop = 1;
      w.motesTaken += 1;
      if (!this.reducedMotion) {
        spawnBurst(w.particles, mote.x, mote.y, 10, PALETTE.screenCore, 140);
      }
      this.publish();
    }
  }

  /**
   * Box against box, and only against the one pillar that can be overlapping.
   *
   * Scanning every pillar would be just as correct and no slower at this count,
   * but the player spans a single pillar's width at most, so finding that one
   * says what the test actually means.
   */
  private checkCollision(): void {
    const w = this.world;

    if (w.playerY + PLAYER_HALF >= GROUND_Y) {
      w.playerY = GROUND_Y - PLAYER_HALF;
      this.die('ground');
      return;
    }

    const pillar = w.pillars.find(
      (p) => PLAYER_X + PLAYER_HALF > p.x && PLAYER_X - PLAYER_HALF < p.x + PILLAR_W,
    );
    if (!pillar) return;

    const top = pillar.gapY - pillar.gap / 2;
    const bottom = pillar.gapY + pillar.gap / 2;
    if (w.playerY - PLAYER_HALF < top || w.playerY + PLAYER_HALF > bottom) this.die('pillar');
  }

  /* --------------------------------------------------------- generation */

  /**
   * Extends the route until there is a screen and a half of it ahead.
   *
   * The gap narrows and the pillars close up over the first `RAMP_OVER`
   * clearances and then stop: a route that keeps tightening for ever turns
   * into a coin flip, and the point where it stops is the point the run is
   * actually about.
   */
  private generateAhead(): void {
    const w = this.world;
    while (this.lastPillarX < WORLD_W + 200) {
      const ramp = Math.min(1, this.generated / RAMP_OVER);
      const gap = GAP_START + (GAP_MIN - GAP_START) * ramp;
      const spacing = SPACING_START + (SPACING_MIN - SPACING_START) * ramp;

      // The band a gap centre may sit in, and the slice of it this pillar may
      // reach from the last one. Clamping the step to the band rather than the
      // other way round means the route never stalls against the ceiling.
      const lo = GAP_MARGIN + gap / 2;
      const hi = GROUND_Y - GAP_MARGIN - gap / 2;
      const from = Math.max(lo, this.lastGapY - MAX_GAP_STEP);
      const to = Math.min(hi, this.lastGapY + MAX_GAP_STEP);
      const gapY = from + Math.random() * Math.max(1, to - from);

      const x = this.lastPillarX + spacing;
      w.pillars.push({ x, gapY, gap, passed: false, flash: 0 });
      this.lastPillarX = x;
      this.lastGapY = gapY;
      this.generated += 1;

      // A mote marks the line through the gap — worth taking, never required,
      // and offset just enough that centring the mark is not automatic.
      if (Math.random() < 0.5) {
        w.motes.push({
          x: x + PILLAR_W / 2,
          y: gapY + (Math.random() - 0.5) * gap * 0.3,
          taken: false,
          pop: 0,
        });
      }

      this.maybeAddDraft(x, spacing);
    }
  }

  /**
   * An updraft sits in the open air between two pillars, never across one.
   *
   * Overlapping a pillar would mean the lift arrives at the same moment the
   * gap does, which is the one place the player cannot afford a surprise.
   */
  private maybeAddDraft(pillarX: number, spacing: number): void {
    if (Math.random() > 0.3) return;
    const open = spacing - PILLAR_W;
    if (open < DRAFT_W + 40) return;
    const slack = open - DRAFT_W;
    this.world.drafts.push({
      x: pillarX + PILLAR_W + 20 + Math.random() * Math.max(0, slack - 40),
      w: DRAFT_W,
    });
  }

  private decay(dt: number): void {
    const w = this.world;
    for (const mote of w.motes) {
      if (mote.taken) mote.pop = Math.max(0, mote.pop - dt * 3.2);
    }
    for (const pillar of w.pillars) {
      pillar.flash = Math.max(0, pillar.flash - dt * 4.8);
    }
  }

  /** Drops anything that has scrolled off the left. */
  private cull(): void {
    const w = this.world;
    const edge = -CULL_MARGIN;
    if (w.pillars.length && w.pillars[0].x + PILLAR_W < edge) w.pillars.shift();
    if (w.drafts.length && w.drafts[0].x + w.drafts[0].w < edge) w.drafts.shift();
    while (w.motes.length && (w.motes[0].x < edge || (w.motes[0].taken && w.motes[0].pop <= 0.01))) {
      w.motes.shift();
    }
  }

  private die(cause: 'pillar' | 'ground'): void {
    const w = this.world;
    w.cause = cause;
    // Read the previous best *before* storing this run, or every run ties its
    // own score and reports itself as a record.
    const previous = getBest('updraft');
    w.record = w.score > 0 && (previous === undefined || w.score > previous);
    submitScore('updraft', w.score);
    if (!this.reducedMotion) {
      spawnBurst(w.particles, PLAYER_X, w.playerY, 14, PALETTE.amber, 190);
    }
    this.finish('lost');
  }

  /* -------------------------------------------------------------- input */

  private flap(): void {
    const w = this.world;
    if (w.flapCooldown > 0) return;
    w.flapCooldown = FLAP_COOLDOWN;
    w.vy = FLAP_VY;
    w.beat = 1;
    if (!this.reducedMotion) {
      spawnBurst(w.particles, PLAYER_X - 6, w.playerY + PLAYER_SIZE * 0.3, 5, PALETTE.amber, 90);
    }
    this.publish();
  }

  handleKey(event: KeyboardEvent, down: boolean): boolean {
    const isFlap =
      isActionKey(event.key) || event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W';
    if (!isFlap) return false;

    if (!down) {
      this.flapHeld = false;
      return true;
    }
    // Ignore the auto-repeat storm from a held key; one press is one flap.
    if (this.flapHeld) return true;
    this.flapHeld = true;

    if (this.status === 'ready') {
      this.start();
      this.flap();
      return true;
    }
    if (this.status === 'paused') {
      this.resume();
      return true;
    }
    if (this.status === 'playing') this.flap();
    return true;
  }

  handlePointer(event: PointerEvent): void {
    if (event.type !== 'pointerdown') return;
    if (this.status === 'ready') {
      this.start();
      this.flap();
    } else if (this.status === 'paused') this.resume();
    else if (this.status === 'playing') this.flap();
  }

  /* ------------------------------------------------------ presentation */

  protected onRender(ctx: CanvasRenderingContext2D, view: GameContext): void {
    renderUpdraft(ctx, view, this.world, this.status);
  }

  protected buildState(): GameState {
    const w = this.world;
    const best = getBest('updraft');

    const state: GameState = {
      status: this.status,
      readouts: [
        { label: 'SCORE', value: String(w.score), tone: 'accent' },
        { label: 'BEST', value: best === undefined ? '—' : String(best) },
        { label: 'MOTES', value: String(w.motesTaken), tone: 'live' },
      ],
    };

    if (this.status === 'lost') {
      state.resultTitle = w.record ? 'NEW BEST' : w.cause === 'ground' ? 'GROUNDED' : 'CLIPPED';
      state.resultDetail = `${w.score} gap${w.score === 1 ? '' : 's'} flown, ${
        w.motesTaken
      } mote${w.motesTaken === 1 ? '' : 's'} collected.`;
      state.resultTone = w.record ? 'win' : w.score >= 10 ? 'near' : 'loss';
    }
    return state;
  }
}

/** The opening state of a run. Module-level so the field initialiser and
 *  `onReset` share one definition. */
function freshWorld(): UpdraftWorld {
  return {
    playerY: VIEW_H * 0.42,
    vy: 0,
    pillars: [],
    motes: [],
    drafts: [],
    particles: [],
    flapCooldown: 0,
    score: 0,
    motesTaken: 0,
    tilt: 0,
    beat: 0,
    inDraft: false,
    trail: [],
    clock: 0,
    record: false,
    cause: null,
  };
}
