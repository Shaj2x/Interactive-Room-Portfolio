import type { GameContext, GameStatus } from '../arcadeTypes';
import { letterbox } from '../gameLoop';
import {
  alpha,
  drawParticles,
  PALETTE,
  paintStageBackground,
  roundRect,
  withGlow,
} from '../palette';
import { BOARD_H, BOARD_W, CELL, GRID_H, GRID_W, type Cell } from './constants';
import type { SnakeWorld } from './SnakeGame';

export function renderSnake(
  ctx: CanvasRenderingContext2D,
  view: GameContext,
  world: SnakeWorld,
  status: GameStatus,
): void {
  paintStageBackground(ctx, view.width, view.height);

  const box = letterbox(view, BOARD_W, BOARD_H);
  if (box.scale <= 0) return;

  ctx.save();
  ctx.translate(box.offsetX, box.offsetY);
  ctx.scale(box.scale, box.scale);

  drawGrid(ctx);
  drawFood(ctx, world, view.reducedMotion);
  drawSnake(ctx, world, status, view.reducedMotion);
  drawParticles(ctx, world.particles);

  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D): void {
  // Alternating cells, barely there: enough to judge distance by, not a board.
  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      if ((x + y) % 2 === 0) continue;
      ctx.fillStyle = alpha(PALETTE.navyHi, 0.3);
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }
  ctx.strokeStyle = alpha(PALETTE.screen, 0.12);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.75, 0.75, BOARD_W - 1.5, BOARD_H - 1.5);
}

function drawFood(ctx: CanvasRenderingContext2D, world: SnakeWorld, reduced: boolean): void {
  const cx = world.food.x * CELL + CELL / 2;
  const cy = world.food.y * CELL + CELL / 2;
  // A slow breath, so the node reads as live rather than painted on.
  const pulse = reduced ? 0.5 : 0.5 + Math.sin(world.clock * 4) * 0.5;
  const r = CELL * (0.26 + pulse * 0.07);

  if (!reduced) {
    ctx.fillStyle = alpha(PALETTE.teal, 0.1 + pulse * 0.1);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.1, 0, Math.PI * 2);
    ctx.fill();
  }

  withGlow(ctx, alpha(PALETTE.teal, 0.85), reduced ? 8 : 16 + pulse * 10, () => {
    ctx.fillStyle = PALETTE.teal;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = alpha(PALETTE.screenCore, 0.85);
  ctx.beginPath();
  ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Interpolates each segment between where it was last tick and where it is
 * now, so the snake glides instead of stepping. A segment that wrapped the
 * board is snapped rather than interpolated — otherwise it would streak the
 * whole width on the frame it crossed.
 */
function segmentPosition(world: SnakeWorld, index: number, status: GameStatus): Cell {
  const current = world.cells[index];
  const previous = world.previous[index];
  if (!previous || status !== 'playing') return { x: current.x * CELL, y: current.y * CELL };
  if (Math.abs(current.x - previous.x) > 1 || Math.abs(current.y - previous.y) > 1) {
    return { x: current.x * CELL, y: current.y * CELL };
  }
  const t = world.tickProgress;
  return {
    x: (previous.x + (current.x - previous.x) * t) * CELL,
    y: (previous.y + (current.y - previous.y) * t) * CELL,
  };
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  world: SnakeWorld,
  status: GameStatus,
  reduced: boolean,
): void {
  const n = world.cells.length;
  const pad = CELL * 0.11;
  const size = CELL - pad * 2;

  // Tail first so the head paints over its neighbour.
  for (let i = n - 1; i >= 1; i -= 1) {
    const p = segmentPosition(world, i, status);
    // Body fades toward the tail: the direction of travel is readable even
    // from a still frame.
    const t = 1 - i / n;
    ctx.fillStyle = alpha(PALETTE.amber, 0.3 + t * 0.45);
    roundRect(ctx, p.x + pad, p.y + pad, size, size, CELL * 0.26);
    ctx.fill();
  }

  const head = segmentPosition(world, 0, status);
  const flash = world.eatFlash;
  withGlow(ctx, alpha(PALETTE.amber, 0.7), reduced ? 10 : 16 + flash * 20, () => {
    ctx.fillStyle = status === 'lost' ? PALETTE.amberDeep : PALETTE.amber;
    roundRect(ctx, head.x + pad * 0.6, head.y + pad * 0.6, CELL - pad * 1.2, CELL - pad * 1.2, CELL * 0.3);
    ctx.fill();
  });

  drawEyes(ctx, head.x + CELL / 2, head.y + CELL / 2, world.direction);
}

/** Two eyes facing the way the snake is going — the cheapest way to make it alive. */
function drawEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  direction: SnakeWorld['direction'],
): void {
  const forward =
    direction === 'up'
      ? { x: 0, y: -1 }
      : direction === 'down'
        ? { x: 0, y: 1 }
        : direction === 'left'
          ? { x: -1, y: 0 }
          : { x: 1, y: 0 };
  // Perpendicular: separates the two eyes across the head.
  const side = { x: -forward.y, y: forward.x };
  const ahead = CELL * 0.17;
  const apart = CELL * 0.17;
  const r = CELL * 0.075;

  ctx.fillStyle = PALETTE.void;
  for (const sign of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      cx + forward.x * ahead + side.x * apart * sign,
      cy + forward.y * ahead + side.y * apart * sign,
      r,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
