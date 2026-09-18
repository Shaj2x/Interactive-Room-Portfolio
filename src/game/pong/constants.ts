/**
 * Court geometry, in the fixed 1000x620 logical units the court is authored
 * in. Shared by the rules and the renderer so the two can never disagree about
 * where a paddle is.
 */
export const COURT_W = 1000;
export const COURT_H = 620;
export const PADDLE_W = 14;
export const PADDLE_H = 108;
export const BALL_R = 9;
/** Distance from the side wall to the back of a paddle. */
export const INSET = 38;

/** Logical aspect of the court. The stage is shaped to this so the game fills it. */
export const ASPECT = COURT_W / COURT_H;
