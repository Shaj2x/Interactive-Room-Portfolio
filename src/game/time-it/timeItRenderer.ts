import type { GameContext, GameStatus } from '../arcadeTypes';
import {
  alpha,
  drawLabel,
  FONT_DISPLAY,
  FONT_MONO,
  PALETTE,
  paintStageBackground,
  withGlow,
} from '../palette';
import type { Band, TimeItWorld } from './TimeItGame';

/** One accent per band. Missed stays a muted warm grey, never red. */
const BAND_COLOUR: Record<Band, string> = {
  perfect: PALETTE.amber,
  sharp: PALETTE.teal,
  close: PALETTE.tealDim,
  missed: '#8a7360',
};

export function renderTimeIt(
  ctx: CanvasRenderingContext2D,
  view: GameContext,
  world: TimeItWorld,
  status: GameStatus,
): void {
  const { width: w, height: h } = view;
  paintStageBackground(ctx, w, h);

  const cx = w / 2;
  const cy = h / 2 + h * 0.02;
  const radius = Math.min(w, h) * 0.3;
  if (radius <= 0) return;

  const colour =
    status === 'result' && world.result ? BAND_COLOUR[world.result.band] : PALETTE.teal;

  drawDial(ctx, cx, cy, radius, world, status, colour, view.reducedMotion);
  drawReadout(ctx, cx, cy, radius, world, status, colour, view.reducedMotion);
  drawTargetPlate(ctx, cx, cy - radius - Math.min(56, h * 0.11), world);
}

function drawDial(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  world: TimeItWorld,
  status: GameStatus,
  colour: string,
  reduced: boolean,
): void {
  // Track.
  ctx.strokeStyle = alpha(PALETTE.screen, 0.1);
  ctx.lineWidth = Math.max(2, radius * 0.035);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Quarter-second ticks around the face. Decorative, and deliberately not a
  // scale you could read the elapsed time off.
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const major = i % 4 === 0;
    const inner = radius * (major ? 0.87 : 0.92);
    ctx.strokeStyle = alpha(PALETTE.screen, major ? 0.28 : 0.14);
    ctx.lineWidth = major ? 2 : 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * radius * 0.79, cy + Math.sin(angle) * radius * 0.79);
    ctx.stroke();
  }

  if (status === 'ready') return;

  // The sweep. Its speed is re-rolled every run, so it reports that time is
  // passing without reporting how much — the whole point of the game.
  const turns = world.running / world.sweepPeriod;
  const angle = turns * Math.PI * 2 - Math.PI / 2;
  const tail = Math.min(turns, 1) * Math.PI * 2;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = alpha(colour, status === 'playing' ? 0.55 : 0.32);
  ctx.lineWidth = Math.max(2, radius * 0.035);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, angle - Math.min(tail, Math.PI * 0.6), angle);
  ctx.stroke();
  ctx.restore();

  const hx = cx + Math.cos(angle) * radius;
  const hy = cy + Math.sin(angle) * radius;
  withGlow(ctx, alpha(colour, 0.9), reduced ? 6 : 18, () => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(hx, hy, radius * 0.045, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawReadout(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  world: TimeItWorld,
  status: GameStatus,
  colour: string,
  reduced: boolean,
): void {
  const size = radius * 0.62;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (status === 'playing') {
    // The clock is deliberately masked. Showing it would make the game a
    // reading test rather than a judgement of time.
    ctx.font = `${size}px ${FONT_DISPLAY}`;
    ctx.fillStyle = alpha(PALETTE.screen, 0.35);
    ctx.fillText('—.——', cx, cy);
  } else if (status === 'result' && world.result) {
    const t = reduced ? 1 : world.reveal;
    ctx.globalAlpha = t;
    ctx.font = `${size * (0.94 + t * 0.06)}px ${FONT_DISPLAY}`;
    ctx.fillStyle = PALETTE.screenCore;
    ctx.fillText(world.result.stopped.toFixed(2), cx, cy);
    ctx.globalAlpha = 1;

    const delta = world.result.delta;
    drawLabel(
      ctx,
      `${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(2)}s`,
      cx,
      cy + size * 0.62,
      Math.max(11, radius * 0.1),
      alpha(colour, 0.9),
      'center',
    );
  } else {
    ctx.font = `${size}px ${FONT_DISPLAY}`;
    ctx.fillStyle = alpha(PALETTE.screen, 0.22);
    ctx.fillText('0.00', cx, cy);
  }
  ctx.restore();

  if (status === 'result' && world.result) {
    drawLabel(
      ctx,
      world.result.label,
      cx,
      cy - radius * 0.56,
      Math.max(11, radius * 0.11),
      colour,
      'center',
    );
  }
}

/** The mechanical mono readout of the target, above the dial. */
function drawTargetPlate(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  world: TimeItWorld,
): void {
  drawLabel(ctx, 'TARGET', cx, y - 16, 11, alpha(PALETTE.teal, 0.65), 'center');
  ctx.save();
  ctx.font = `28px ${FONT_MONO}`;
  ctx.fillStyle = PALETTE.screenCore;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${world.target.toFixed(2)}s`, cx, y + 12);
  ctx.restore();

  if (world.streak > 1) {
    drawLabel(
      ctx,
      `STREAK ${world.streak}`,
      cx,
      y + 40,
      11,
      alpha(PALETTE.amber, 0.8),
      'center',
    );
  }
}
