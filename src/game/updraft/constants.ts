/**
 * Updraft's world, in fixed logical units letterboxed into the stage.
 *
 * `y` increases downward, canvas-native, and the player starts at y = 0.
 * Climbing therefore makes `y` negative, and height is measured as how far
 * below zero the player has been.
 */
export const WORLD_W = 900;
export const VIEW_H = 620;

/** Logical aspect of the climb column. The stage is shaped to this. */
export const ASPECT = WORLD_W / VIEW_H;

export const GRAVITY = 1450;
/** Upward velocity given by landing on a platform. */
export const BOUNCE = -700;
/** How much upward velocity one flap adds, and the ceiling it may reach. */
export const FLAP_IMPULSE = 360;
export const FLAP_CEILING = -620;
/**
 * Flaps available between landings. Without a limit the player could hover
 * forever and a missed platform would never end the run.
 */
export const MAX_FLAPS = 2;
/** Minimum time between flaps, so holding the key is not a rocket. */
export const FLAP_COOLDOWN = 0.14;

/** Constant forward drift. The world scrolls past; the player does not steer it. */
export const FORWARD_SPEED = 195;

export const PLAYER_W = 26;
export const PLAYER_H = 30;

/**
 * The highest a single bounce reaches: v²/2g. Every generated gap is kept
 * under this, so the route is always climbable on bounces alone and flaps are
 * for correction rather than survival.
 */
export const BOUNCE_RISE = (BOUNCE * BOUNCE) / (2 * GRAVITY);

/** One metre of displayed height, in world units. */
export const METRE = 10;

/**
 * Where the player stands at the start: one body above the opening ledger.
 * Height is measured from here, so a run that ends immediately reads 0m rather
 * than crediting the starting offset as a climb.
 */
export const START_Y = -PLAYER_H;

export interface Platform {
  x: number;
  y: number;
  w: number;
  /** Fades after the player lands on it. */
  flash: number;
}

export interface Mote {
  x: number;
  y: number;
  taken: boolean;
  /** Animates the collection pop. */
  pop: number;
}

export interface WindZone {
  /** Smaller y — the far side, reached last. */
  yTop: number;
  /** Larger y — the near side, entered first. */
  yBottom: number;
  /** World units per second, signed. */
  strength: number;
}

/** Shortest signed distance from `a` to `b` on a horizontally wrapping world. */
export function wrapDelta(a: number, b: number): number {
  let d = b - a;
  while (d > WORLD_W / 2) d -= WORLD_W;
  while (d < -WORLD_W / 2) d += WORLD_W;
  return d;
}

export function wrapX(x: number): number {
  return ((x % WORLD_W) + WORLD_W) % WORLD_W;
}
