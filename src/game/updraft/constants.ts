/**
 * Updraft's world, in fixed logical units letterboxed into the stage.
 *
 * A flap-and-gap game: the player holds one screen x and the route slides past
 * them, so every position below is either a world x that decreases over time or
 * a y that never moves. `y` increases downward, canvas-native.
 */
export const WORLD_W = 800;
export const VIEW_H = 620;

/** Logical aspect of the flight lane. The stage is shaped to this. */
export const ASPECT = WORLD_W / VIEW_H;

/** Top of the floor strip. Touching it ends the run. */
export const GROUND_Y = 566;

export const GRAVITY = 1900;
/**
 * A flap *sets* upward velocity rather than adding to it. Adding makes a fast
 * tapper accelerate away off the top of the screen; setting is what makes the
 * flap feel like the same flap every time, which is the whole control scheme.
 */
export const FLAP_VY = -545;
/** Terminal velocity. Without it a long drop becomes unrecoverable in one flap. */
export const MAX_FALL = 980;
/** Shortest time between flaps, so holding the key is not a rocket. */
export const FLAP_COOLDOWN = 0.09;

/** Constant forward drift. The route scrolls past; the player does not steer it. */
export const FORWARD_SPEED = 212;

/** The player is a square: it is the logo, and the logo is drawn to a square. */
export const PLAYER_SIZE = 34;
/** Where the player sits across the lane. Everything ahead of it is the route. */
export const PLAYER_X = 208;
/**
 * Collision half-extent, smaller than the mark itself. A hitbox that matches
 * the art exactly reads as unfair, because the corners of a rounded mark are
 * mostly empty. Four fifths is about where a clip stops feeling stolen.
 */
export const PLAYER_HALF = PLAYER_SIZE * 0.4;

export const PILLAR_W = 76;
/** Gap between pillar centres at the start, and once the route is at its tightest. */
export const SPACING_START = 320;
export const SPACING_MIN = 272;
export const GAP_START = 182;
export const GAP_MIN = 138;
/** Pillars cleared before the route stops getting harder. */
export const RAMP_OVER = 22;

/**
 * Most a gap centre may move between neighbouring pillars.
 *
 * Not a reachability limit — reachability is not the binding constraint here.
 * A chain of flaps climbs about 355 units per second, and the crossing between
 * two pillars lasts `SPACING_MIN / FORWARD_SPEED` = 1.28s, so the player can
 * cover roughly 455 units vertically in the time it takes to reach the next
 * gap. The whole usable band is only 276. Every gap is reachable from every
 * other one, always.
 *
 * This is a fairness limit instead. A route allowed the full band would ask
 * for a floor-to-ceiling traverse with no warning, which reads as random even
 * though it can be flown. Just under half the band keeps each gap a correction
 * rather than a scramble.
 */
export const MAX_GAP_STEP = 124;

/** A gap is never placed nearer the ceiling or the floor than this. */
export const GAP_MARGIN = 54;

/** Width of an updraft column, and the upward pull inside one. */
export const DRAFT_W = 132;
/**
 * Kept under gravity on purpose. A draft that beat gravity would hold the
 * player up on its own and the game would play itself through that stretch;
 * at this strength it slows a fall to a drift and rewards a player who aims
 * for it.
 */
export const DRAFT_LIFT = 1180;

/**
 * How long a sample of the player's wake survives.
 *
 * It lives here rather than with the game because the renderer needs it to
 * fade a sample by its age, and one definition is the only way the fade and
 * the culling can agree about when a point is gone.
 */
export const TRAIL_LIFE = 0.34;

export interface Pillar {
  /** Left edge, in world units. Decreases as the route scrolls past. */
  x: number;
  /** Centre of the gap. */
  gapY: number;
  gap: number;
  /** Set once the player is past it, so it is only ever scored once. */
  passed: boolean;
  /** Fades after it is cleared. */
  flash: number;
}

export interface Mote {
  x: number;
  y: number;
  taken: boolean;
  /** Animates the collection pop. */
  pop: number;
}

export interface Draft {
  /** Left edge, in world units. */
  x: number;
  w: number;
}
