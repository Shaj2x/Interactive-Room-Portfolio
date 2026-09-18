/** Board geometry, shared by the rules and the renderer. */
export const GRID_W = 28;
export const GRID_H = 18;
/** Logical pixels per cell. The board is letterboxed into the stage from here. */
export const CELL = 34;
export const BOARD_W = GRID_W * CELL;
export const BOARD_H = GRID_H * CELL;

/** Logical aspect of the board. The stage is shaped to this so the game fills it. */
export const ASPECT = BOARD_W / BOARD_H;

export interface Cell {
  x: number;
  y: number;
}
