import type { GameContext, GameState } from '../arcadeTypes';
import { BaseGame } from '../gameLoop';
import { isActionKey } from '../input';
import { PALETTE, spawnBurst, stepParticles, type Particle } from '../palette';
import { getBest, submitScore } from '../scoreStore';
import {
  BOUNCE,
  BOUNCE_RISE,
  FLAP_CEILING,
  FLAP_COOLDOWN,
  FLAP_IMPULSE,
  FORWARD_SPEED,
  GRAVITY,
  MAX_FLAPS,
  METRE,
  PLAYER_H,
  PLAYER_W,
  START_Y,
  VIEW_H,
  WORLD_W,
  wrapDelta,
  wrapX,
  type Mote,
  type Platform,
  type WindZone,
} from './constants';
import { renderUpdraft } from './updraftRenderer';

/** How far down the view the player is held. The rest is the route ahead. */
const CAMERA_ANCHOR = 0.64;
/** Past this far below the camera, the run is over. */
const FALL_MARGIN = 60;

/**
 * How often the off-screen route is swept up. Rebuilding three arrays is not
 * something to do on every physics step — a platform lingering a fifth of a
 * second longer than it needs to costs nothing, and the renderer culls by
 * camera bounds anyway.
 */
const CULL_INTERVAL = 0.2;

export interface UpdraftWorld {
  playerX: number;
  playerY: number;
  vx: number;
  vy: number;
  /** Camera's world y at the top edge of the view. Only ever decreases. */
  cameraY: number;
  /** Lowest (most negative) y reached. Height is measured from this. */
  peakY: number;
  platforms: Platform[];
  motes: Mote[];
  winds: WindZone[];
  particles: Particle[];
  flaps: number;
  flapCooldown: number;
  motesTaken: number;
  /** Squash on landing, 1 to 0. */
  squash: number;
  /** Recent positions, for the motion trail. */
  trail: Array<{ x: number; y: number }>;
  /** Wind currently acting on the player, for the HUD and the lean. */
  activeWind: number;
  clock: number;
  /** Set once the fall that ends the run has begun. */
  falling: boolean;
  /** Whether the finished run beat the previous best. Decided before it is stored. */
  record: boolean;
}

export class UpdraftGame extends BaseGame {
  readonly title = 'Updraft';
  readonly objective = 'Climb the weather. Land to bounce, flap to correct.';
  readonly controls = 'Space or ↑ · click · tap';

  private world: UpdraftWorld = freshWorld();
  /** y of the highest platform generated so far; generation continues from here. */
  private highestY = 0;
  private lastPlatformX = WORLD_W / 2;
  private flapHeld = false;
  private cullTimer = 0;

  /* ---------------------------------------------------------- lifecycle */

  protected onReset(): void {
    this.world = freshWorld();
    this.highestY = 0;
    this.lastPlatformX = WORLD_W / 2;
    this.flapHeld = false;
    this.cullTimer = 0;

    // A wide ledger directly under the player, so the first bounce is free.
    const ground: Platform = { x: WORLD_W / 2 - 150, y: 0, w: 300, flash: 0 };
    this.world.platforms.push(ground);
    this.lastPlatformX = ground.x + ground.w / 2;
    this.generateAhead();
  }

  protected onUpdate(dt: number): void {
    const w = this.world;
    w.clock += dt;
    w.squash = Math.max(0, w.squash - dt * 5);
    w.flapCooldown = Math.max(0, w.flapCooldown - dt);
    stepParticles(w.particles, dt, 1.1);

    this.applyWind(dt);

    // Horizontal: constant forward drift plus whatever the weather is doing.
    w.playerX = wrapX(w.playerX + w.vx * dt);

    const previousY = w.playerY;
    w.vy += GRAVITY * dt;
    w.playerY += w.vy * dt;

    this.resolveLanding(previousY);
    this.collectMotes();

    if (w.playerY < w.peakY) w.peakY = w.playerY;

    // The camera rises with the player and never comes back down: falling
    // means falling out of the frame, which is what ends the run.
    const wanted = w.playerY - VIEW_H * CAMERA_ANCHOR;
    if (wanted < w.cameraY) w.cameraY = wanted;

    if (!this.reducedMotion) {
      w.trail.push({ x: w.playerX, y: w.playerY });
      if (w.trail.length > 14) w.trail.shift();
    } else {
      w.trail.length = 0;
    }

    this.generateAhead();
    this.decay(dt);
    this.cullTimer -= dt;
    if (this.cullTimer <= 0) {
      this.cull();
      this.cullTimer = CULL_INTERVAL;
    }

    if (w.vy > 0 && w.playerY > w.cameraY + VIEW_H * 0.92) w.falling = true;
    if (w.playerY > w.cameraY + VIEW_H + FALL_MARGIN) this.die();
  }

  /* -------------------------------------------------------------- rules */

  private applyWind(dt: number): void {
    const w = this.world;
    const zone = w.winds.find((z) => w.playerY <= z.yBottom && w.playerY >= z.yTop);
    const target = zone ? zone.strength : 0;
    w.activeWind = target;
    // Ease into the gust rather than snapping, so a zone edge is not a wall.
    const wanted = FORWARD_SPEED + target;
    w.vx += (wanted - w.vx) * Math.min(1, dt * 3.5);
  }

  /**
   * Landing is checked as a swept test between the previous and current
   * position. At full fall speed the player covers more than a platform's
   * thickness in one step, so a point-in-box test would fall straight through.
   */
  private resolveLanding(previousY: number): void {
    const w = this.world;
    if (w.vy <= 0) return;

    const halfW = PLAYER_W / 2;
    const previousFoot = previousY + PLAYER_H / 2;
    const foot = w.playerY + PLAYER_H / 2;

    for (const platform of w.platforms) {
      if (previousFoot > platform.y || foot < platform.y) continue;
      const centre = platform.x + platform.w / 2;
      if (Math.abs(wrapDelta(centre, w.playerX)) > platform.w / 2 + halfW) continue;

      w.playerY = platform.y - PLAYER_H / 2;
      w.vy = BOUNCE;
      w.flaps = MAX_FLAPS;
      w.squash = 1;
      platform.flash = 1;
      if (!this.reducedMotion) {
        spawnBurst(w.particles, w.playerX, platform.y, 8, PALETTE.teal, 120);
      }
      this.publish();
      return;
    }
  }

  private collectMotes(): void {
    const w = this.world;
    for (const mote of w.motes) {
      if (mote.taken) continue;
      if (Math.abs(mote.y - w.playerY) > 26) continue;
      if (Math.abs(wrapDelta(mote.x, w.playerX)) > 26) continue;
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
   * Generates the route above the player.
   *
   * Each platform is placed where the player will actually be: the vertical
   * gap is kept under a single bounce's rise, the flight time for that gap is
   * solved from the projectile equation, and the next platform is put at the
   * x the drift carries the player to in that time. Wind at the destination
   * altitude is folded in, so a gust cannot make a gap unreachable.
   */
  private generateAhead(): void {
    const w = this.world;
    const ceiling = w.cameraY - VIEW_H;

    while (this.highestY > ceiling) {
      const climbed = Math.max(0, -this.highestY) / METRE;
      // Difficulty ramps by spacing, and tops out so it never becomes a coin flip.
      const ramp = Math.min(1, climbed / 900);
      const minGap = 95 + ramp * 28;
      const maxGap = Math.min(BOUNCE_RISE * 0.94, 140 + ramp * 24);
      const gap = minGap + Math.random() * Math.max(8, maxGap - minGap);

      const nextY = this.highestY - gap;
      const flight = UpdraftGame.timeToRise(gap);

      // Wind the player will be inside for that flight, so generation and
      // physics agree about where the drift ends up.
      const wind = this.windAt(nextY);
      const drift = (FORWARD_SPEED + wind) * flight;
      // Jitter keeps the route from becoming a metronome, and stays inside
      // what two flaps of hang time can absorb.
      const jitter = (Math.random() - 0.5) * 70;

      const width = 150 + Math.random() * 78;
      const centre = wrapX(this.lastPlatformX + drift + jitter);
      const platform: Platform = { x: wrapX(centre - width / 2), y: nextY, w: width, flash: 0 };
      w.platforms.push(platform);
      this.lastPlatformX = centre;
      this.highestY = nextY;

      // A mote sits in the arc between platforms — worth taking, never required.
      if (Math.random() < 0.42) {
        w.motes.push({
          x: wrapX(centre - drift * 0.45 + (Math.random() - 0.5) * 60),
          y: nextY + gap * 0.55,
          taken: false,
          pop: 0,
        });
      }

      this.maybeAddWind(nextY, ramp);
    }
  }

  /** Time for a bounce to rise `dy`, from the projectile equation. */
  private static timeToRise(dy: number): number {
    const u = -BOUNCE;
    const disc = u * u - 2 * GRAVITY * dy;
    // Guarded, though generation never asks for a gap a bounce cannot make.
    if (disc <= 0) return u / GRAVITY;
    return (u - Math.sqrt(disc)) / GRAVITY;
  }

  private windAt(y: number): number {
    const zone = this.world.winds.find((z) => y <= z.yBottom && y >= z.yTop);
    return zone ? zone.strength : 0;
  }

  private maybeAddWind(y: number, ramp: number): void {
    const w = this.world;
    // Wind gets more frequent with height, but never stacks: a new zone is
    // only placed clear of the last one.
    const chance = 0.06 + ramp * 0.12;
    if (Math.random() > chance) return;
    const last = w.winds[w.winds.length - 1];
    if (last && last.yTop - y < 260) return;

    const height = 220 + Math.random() * 180;
    const strength = (Math.random() < 0.5 ? -1 : 1) * (55 + Math.random() * 45 * ramp);
    w.winds.push({ yTop: y - height, yBottom: y, strength });
  }

  /**
   * Fades the things that fade. Separated from `cull` because it has to happen
   * on every step to be smooth, and because tying a decay rate to how often
   * the sweep ran made it depend on the step rate rather than on time.
   */
  private decay(dt: number): void {
    const w = this.world;
    for (const mote of w.motes) {
      if (mote.taken) mote.pop = Math.max(0, mote.pop - dt * 3.2);
    }
    for (const platform of w.platforms) {
      platform.flash = Math.max(0, platform.flash - dt * 4.8);
    }
  }

  /** Drops anything that has scrolled off the bottom. */
  private cull(): void {
    const w = this.world;
    const floor = w.cameraY + VIEW_H + 260;
    w.platforms = w.platforms.filter((p) => p.y < floor);
    w.motes = w.motes.filter((m) => m.y < floor && (!m.taken || m.pop > 0.01));
    w.winds = w.winds.filter((z) => z.yTop < floor);
  }

  private die(): void {
    const height = this.height();
    // Read the previous best *before* storing this run, or every run ties its
    // own score and reports itself as a record.
    const previous = getBest('updraft');
    this.world.record = height > 0 && (previous === undefined || height > previous);
    submitScore('updraft', height);
    this.finish('lost');
  }

  private height(): number {
    return Math.max(0, Math.round((START_Y - this.world.peakY) / METRE));
  }

  /* -------------------------------------------------------------- input */

  private flap(): void {
    const w = this.world;
    if (w.flaps <= 0 || w.flapCooldown > 0) return;
    w.flaps -= 1;
    w.flapCooldown = FLAP_COOLDOWN;
    w.vy = Math.max(w.vy - FLAP_IMPULSE, FLAP_CEILING);
    if (!this.reducedMotion) {
      spawnBurst(w.particles, w.playerX, w.playerY + PLAYER_H / 2, 5, PALETTE.amber, 90);
    }
    this.publish();
  }

  handleKey(event: KeyboardEvent, down: boolean): boolean {
    const isFlap = isActionKey(event.key) || event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W';
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
    if (this.status === 'ready') this.start();
    else if (this.status === 'paused') this.resume();
    else if (this.status === 'playing') this.flap();
  }

  /* ------------------------------------------------------ presentation */

  protected onRender(ctx: CanvasRenderingContext2D, view: GameContext): void {
    renderUpdraft(ctx, view, this.world, this.status);
  }

  protected buildState(): GameState {
    const w = this.world;
    const best = getBest('updraft');
    const height = this.height();

    const state: GameState = {
      status: this.status,
      readouts: [
        { label: 'HEIGHT', value: `${height}m`, tone: 'accent' },
        { label: 'BEST', value: best === undefined ? '—' : `${best}m` },
        { label: 'MOTES', value: String(w.motesTaken), tone: 'live' },
        { label: 'LIFT', value: '•'.repeat(w.flaps) + '·'.repeat(MAX_FLAPS - w.flaps) },
      ],
    };

    if (this.status === 'lost') {
      const record = w.record;
      state.resultTitle = record ? 'NEW CEILING' : 'DOWNDRAFT';
      state.resultDetail = `${height}m climbed, ${w.motesTaken} mote${
        w.motesTaken === 1 ? '' : 's'
      } collected.`;
      state.resultTone = record ? 'win' : height >= 150 ? 'near' : 'loss';
    }
    return state;
  }
}

/** The opening state of a run. Module-level so the field initialiser and
 *  `onReset` share one definition. */
function freshWorld(): UpdraftWorld {
  return {
    playerX: WORLD_W / 2,
    playerY: START_Y,
    vx: FORWARD_SPEED,
    vy: 0,
    cameraY: -VIEW_H * CAMERA_ANCHOR,
    peakY: START_Y,
    platforms: [],
    motes: [],
    winds: [],
    particles: [],
    flaps: MAX_FLAPS,
    flapCooldown: 0,
    motesTaken: 0,
    squash: 0,
    trail: [],
    activeWind: 0,
    clock: 0,
    falling: false,
    record: false,
  };
}
