import type { GameContext, GameStatus } from '../arcadeTypes';
import { letterbox } from '../gameLoop';
import {
  alpha,
  drawLabel,
  drawParticles,
  FONT_DISPLAY,
  PALETTE,
  paintStageBackground,
  roundRect,
  withGlow,
} from '../palette';
import { BALL_R, COURT_H, COURT_W, INSET, PADDLE_H, PADDLE_W } from './constants';
import type { PongWorld } from './PongGame';

/**
 * Draws the court. Pure: everything it needs arrives in `world`, and it never
 * writes back. That keeps "what the game is" and "what it looks like" apart,
 * and makes the renderer safe to call in any state including `ready`.
 */
export function renderPong(
  ctx: CanvasRenderingContext2D,
  view: GameContext,
  world: PongWorld,
  status: GameStatus,
): void {
  paintStageBackground(ctx, view.width, view.height);

  const box = letterbox(view, COURT_W, COURT_H);
  if (box.scale <= 0) return;

  ctx.save();
  ctx.translate(box.offsetX, box.offsetY);
  ctx.scale(box.scale, box.scale);

  drawCourt(ctx);
  drawScores(ctx, world);

  // The ball is hidden between points; the countdown stands in for it.
  if (world.serveIn <= 0 || status === 'ready') {
    if (!view.reducedMotion) drawTrail(ctx, world);
    drawBall(ctx, world);
  }

  drawPaddle(ctx, INSET, world.playerY, PALETTE.amber, world.playerFlash, view.reducedMotion);
  drawPaddle(
    ctx,
    COURT_W - INSET - PADDLE_W,
    world.aiY,
    PALETTE.teal,
    world.aiFlash,
    view.reducedMotion,
  );

  drawParticles(ctx, world.particles);

  if (world.serveIn > 0 && status === 'playing') drawCountdown(ctx, world.serveIn);

  ctx.restore();
}

function drawCourt(ctx: CanvasRenderingContext2D): void {
  // Outer rule — thin, editorial, not a game border.
  ctx.strokeStyle = alpha(PALETTE.screen, 0.14);
  ctx.lineWidth = 1.5;
  roundRect(ctx, 6, 6, COURT_W - 12, COURT_H - 12, 4);
  ctx.stroke();

  // Centre line, dashed.
  ctx.save();
  ctx.setLineDash([9, 16]);
  ctx.strokeStyle = alpha(PALETTE.screen, 0.16);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(COURT_W / 2, 22);
  ctx.lineTo(COURT_W / 2, COURT_H - 22);
  ctx.stroke();
  ctx.restore();

  // Service marks: quiet ticks that give the eye something to judge angle by.
  ctx.strokeStyle = alpha(PALETTE.screen, 0.1);
  ctx.lineWidth = 1.5;
  for (const y of [COURT_H * 0.25, COURT_H * 0.5, COURT_H * 0.75]) {
    ctx.beginPath();
    ctx.moveTo(INSET - 14, y);
    ctx.lineTo(INSET - 4, y);
    ctx.moveTo(COURT_W - INSET + 4, y);
    ctx.lineTo(COURT_W - INSET + 14, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(COURT_W / 2, COURT_H / 2, 54, 0, Math.PI * 2);
  ctx.strokeStyle = alpha(PALETTE.screen, 0.07);
  ctx.stroke();
}

function drawScores(ctx: CanvasRenderingContext2D, world: PongWorld): void {
  ctx.save();
  ctx.font = `128px ${FONT_DISPLAY}`;
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'right';
  ctx.fillStyle = alpha(PALETTE.amber, 0.17);
  ctx.fillText(String(world.playerScore), COURT_W / 2 - 46, 112);

  ctx.textAlign = 'left';
  ctx.fillStyle = alpha(PALETTE.teal, 0.17);
  ctx.fillText(String(world.aiScore), COURT_W / 2 + 46, 112);
  ctx.restore();

  drawLabel(ctx, 'YOU', COURT_W / 2 - 46, 176, 11, alpha(PALETTE.amber, 0.5), 'right');
  drawLabel(ctx, 'CPU', COURT_W / 2 + 46, 176, 11, alpha(PALETTE.teal, 0.5), 'left');
}

function drawTrail(ctx: CanvasRenderingContext2D, world: PongWorld): void {
  const n = world.trail.length;
  for (let i = 0; i < n; i += 1) {
    const t = (i + 1) / n;
    const p = world.trail[i];
    ctx.globalAlpha = t * 0.3;
    ctx.fillStyle = PALETTE.screen;
    ctx.beginPath();
    ctx.arc(p.x, p.y, BALL_R * t * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBall(ctx: CanvasRenderingContext2D, world: PongWorld): void {
  withGlow(ctx, alpha(PALETTE.screenCore, 0.9), 22, () => {
    ctx.fillStyle = PALETTE.screenCore;
    ctx.beginPath();
    ctx.arc(world.ballX, world.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  x: number,
  centreY: number,
  colour: string,
  flash: number,
  reducedMotion: boolean,
): void {
  const y = centreY - PADDLE_H / 2;
  const glow = reducedMotion ? 10 : 14 + flash * 26;

  withGlow(ctx, alpha(colour, 0.55 + flash * 0.4), glow, () => {
    ctx.fillStyle = colour;
    roundRect(ctx, x, y, PADDLE_W, PADDLE_H, 5);
    ctx.fill();
  });

  // A brighter core line: reads as a lit edge rather than a flat bar.
  ctx.fillStyle = alpha(PALETTE.screenCore, 0.5 + flash * 0.35);
  roundRect(ctx, x + PADDLE_W * 0.34, y + 8, PADDLE_W * 0.32, PADDLE_H - 16, 2);
  ctx.fill();
}

function drawCountdown(ctx: CanvasRenderingContext2D, serveIn: number): void {
  const count = Math.max(1, Math.ceil(serveIn / 0.7));
  // Each number fades and shrinks across its own 0.7s slice.
  const phase = 1 - ((serveIn % 0.7) / 0.7);

  ctx.save();
  ctx.globalAlpha = 0.25 + (1 - phase) * 0.55;
  ctx.font = `${96 + phase * 26}px ${FONT_DISPLAY}`;
  ctx.fillStyle = PALETTE.screenCore;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(count), COURT_W / 2, COURT_H / 2);
  ctx.restore();

  drawLabel(ctx, 'SERVE', COURT_W / 2, COURT_H / 2 + 74, 11, alpha(PALETTE.teal, 0.6), 'center');
}
