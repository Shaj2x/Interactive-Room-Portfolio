import type { GameContext, GameStatus } from '../arcadeTypes';
import { letterbox } from '../gameLoop';
import { drawLogoMark } from '../logoMark';
import {
  alpha,
  drawParticles,
  FONT_DISPLAY,
  PALETTE,
} from '../palette';
import {
  FORWARD_SPEED,
  GROUND_Y,
  PILLAR_W,
  PLAYER_SIZE,
  PLAYER_X,
  TRAIL_LIFE,
  VIEW_H,
  WORLD_W,
} from './constants';
import type { UpdraftWorld as World } from './UpdraftGame';

export function renderUpdraft(
  ctx: CanvasRenderingContext2D,
  view: GameContext,
  world: World,
  status: GameStatus,
): void {
  const box = letterbox(view, WORLD_W, VIEW_H);
  if (box.scale <= 0) return;

  // The sky fills the whole stage; the route is clipped to the lane, so the
  // pillarbox reads as atmosphere rather than as dead space.
  drawSky(ctx, view, world);

  ctx.save();
  ctx.translate(box.offsetX, box.offsetY);
  ctx.scale(box.scale, box.scale);
  ctx.beginPath();
  ctx.rect(0, 0, WORLD_W, VIEW_H);
  ctx.clip();

  drawGhostScore(ctx, world);
  drawDrafts(ctx, world, view.reducedMotion);
  drawPillars(ctx, world);
  drawMotes(ctx, world, view.reducedMotion);
  if (!view.reducedMotion) drawTrail(ctx, world);
  drawPlayer(ctx, world, status, view.reducedMotion);
  drawParticles(ctx, world.particles);
  drawGround(ctx, world, view.reducedMotion);

  ctx.restore();
}

/* ------------------------------------------------------------------ sky */

/**
 * The night behind the lane, rebuilt only when the viewport changes.
 *
 * It is a fixed gradient — nothing about it depends on the run — so building
 * it once and keeping it is the difference between one gradient per resize and
 * sixty per second.
 */
let skyCache: { key: number; gradient: CanvasGradient } | null = null;

function skyGradient(ctx: CanvasRenderingContext2D, height: number): CanvasGradient {
  if (skyCache && skyCache.key === height) return skyCache.gradient;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#080502');
  sky.addColorStop(0.52, PALETTE.ink);
  sky.addColorStop(1, '#2a1a0f');
  skyCache = { key: height, gradient: sky };
  return sky;
}

function drawSky(ctx: CanvasRenderingContext2D, view: GameContext, world: World): void {
  ctx.fillStyle = skyGradient(ctx, view.height);
  ctx.fillRect(0, 0, view.width, view.height);

  // Night haze, in three layers moving at their own speeds. An earlier pass
  // put a rooftop skyline here; at the size the stage actually renders it read
  // as a wall of blocks competing with the pillars for the foreground, and the
  // pillars have to win that.
  const travelled = world.clock * 212;
  for (let layer = 0; layer < 3; layer += 1) {
    const depth = 0.08 + layer * 0.11;
    const step = 330 + layer * 90;
    const offset = ((travelled * depth) % step + step) % step;
    const band = view.height * (0.46 + layer * 0.17);
    const thickness = view.height * (0.045 + layer * 0.022);
    ctx.fillStyle = alpha(layer === 2 ? PALETTE.amberDeep : PALETTE.navyHi, 0.11 - layer * 0.025);
    for (let x = -offset - step; x < view.width + step; x += step) {
      // A deterministic wobble per slot, so the haze does not shimmer as it
      // scrolls: the same slot draws the same drift every time it comes round.
      const slot = Math.round((x + offset) / step);
      const drift = ((slot * 53) % 11) - 5;
      ctx.beginPath();
      ctx.ellipse(
        x + step * 0.4,
        band + drift * thickness * 0.14,
        step * 0.72,
        thickness,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

/* ----------------------------------------------------------- the score */

/**
 * The count, set large and low-contrast behind the action.
 *
 * The HUD above the stage already carries SCORE as a readout, so this is not
 * information — it is the genre's signature, and it is kept dim enough that
 * the pillars always win the foreground.
 */
function drawGhostScore(ctx: CanvasRenderingContext2D, world: World): void {
  if (world.score === 0) return;
  ctx.save();
  ctx.font = `700 168px ${FONT_DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = alpha(PALETTE.screen, 0.07);
  ctx.fillText(String(world.score), WORLD_W / 2, VIEW_H * 0.3);
  ctx.restore();
}

/* ---------------------------------------------------------- the route */

/**
 * Updraft columns, drawn before they bite.
 *
 * A lift the player cannot see is a lift that feels like a bug, so the column
 * is a visible shaft of rising light with its edges marked. The streaks climb
 * whether or not the player is in it — the air is doing that anyway.
 */
function drawDrafts(ctx: CanvasRenderingContext2D, world: World, reduced: boolean): void {
  for (const draft of world.drafts) {
    if (draft.x > WORLD_W || draft.x + draft.w < 0) continue;

    // The shaft is brightest low down, where the air is being pushed from.
    const shaft = ctx.createLinearGradient(0, GROUND_Y, 0, 0);
    shaft.addColorStop(0, alpha(PALETTE.teal, 0.2));
    shaft.addColorStop(0.55, alpha(PALETTE.teal, 0.1));
    shaft.addColorStop(1, alpha(PALETTE.teal, 0.02));
    ctx.fillStyle = shaft;
    ctx.fillRect(draft.x, 0, draft.w, GROUND_Y);

    // Soft walls rather than hairlines. A 1px rule at this size read as a
    // scratch on the screen instead of as the edge of a body of air.
    const wall = ctx.createLinearGradient(draft.x, 0, draft.x + draft.w, 0);
    wall.addColorStop(0, alpha(PALETTE.teal, 0.34));
    wall.addColorStop(0.12, alpha(PALETTE.teal, 0));
    wall.addColorStop(0.88, alpha(PALETTE.teal, 0));
    wall.addColorStop(1, alpha(PALETTE.teal, 0.34));
    ctx.fillStyle = wall;
    ctx.fillRect(draft.x, 0, draft.w, GROUND_Y);

    // Chevrons up the shaft: the one mark that says which way the air is
    // going without having to be read. They still draw under reduced motion —
    // they just stop travelling. Taking them away would take the information
    // away with the movement, and the lift would arrive unannounced.
    ctx.strokeStyle = alpha(PALETTE.teal, 0.5);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const span = GROUND_Y + 120;
    for (let i = 0; i < 5; i += 1) {
      const phase = reduced
        ? ((i + 0.6) * span) / 5
        : (world.clock * 190 + (i * span) / 5) % span;
      const y = GROUND_Y - phase;
      // Fade in at the bottom and out at the top, so nothing pops into being.
      const fade = Math.min(1, phase / 90, (span - phase) / 140);
      if (fade <= 0) continue;
      ctx.globalAlpha = fade;
      const mid = draft.x + draft.w / 2;
      const arm = draft.w * 0.26;
      ctx.beginPath();
      ctx.moveTo(mid - arm, y + 13);
      ctx.lineTo(mid, y);
      ctx.lineTo(mid + arm, y + 13);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

function drawPillars(ctx: CanvasRenderingContext2D, world: World): void {
  for (const pillar of world.pillars) {
    if (pillar.x > WORLD_W || pillar.x + PILLAR_W < 0) continue;
    const top = pillar.gapY - pillar.gap / 2;
    const bottom = pillar.gapY + pillar.gap / 2;
    drawColumn(ctx, pillar.x, 0, top, pillar.flash, true);
    drawColumn(ctx, pillar.x, bottom, GROUND_Y - bottom, pillar.flash, false);
  }
}

/**
 * One half of a pillar: a warm slab with a lit cap at the gap end.
 *
 * The cap is the part that matters. It is the edge the player is judging, so
 * it is the brightest thing in the lane and the only one drawn with a hard
 * line against the dark.
 */
function drawColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  flash: number,
  capAtBottom: boolean,
): void {
  if (h <= 0) return;

  const body = ctx.createLinearGradient(x, 0, x + PILLAR_W, 0);
  body.addColorStop(0, '#1a1009');
  body.addColorStop(0.3, '#3a2312');
  body.addColorStop(1, '#150c06');
  ctx.fillStyle = body;
  ctx.fillRect(x, y, PILLAR_W, h);

  const capY = capAtBottom ? y + h - 12 : y;
  const capGrad = ctx.createLinearGradient(x, capY, x, capY + 12);
  const lit = alpha(PALETTE.amberDeep, 0.9 + flash * 0.1);
  capGrad.addColorStop(0, capAtBottom ? '#2a1a0e' : lit);
  capGrad.addColorStop(1, capAtBottom ? lit : '#2a1a0e');
  ctx.fillStyle = capGrad;
  ctx.fillRect(x - 5, capY, PILLAR_W + 10, 12);

  const edgeY = capAtBottom ? y + h - 0.5 : y + 0.5;
  ctx.strokeStyle = alpha(PALETTE.amber, 0.42 + flash * 0.45);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - 5, edgeY);
  ctx.lineTo(x + PILLAR_W + 5, edgeY);
  ctx.stroke();
}

function drawMotes(ctx: CanvasRenderingContext2D, world: World, reduced: boolean): void {
  for (const mote of world.motes) {
    if (mote.x > WORLD_W + 20 || mote.x < -20) continue;
    if (mote.taken) {
      if (mote.pop <= 0.01) continue;
      ctx.strokeStyle = alpha(PALETTE.screenCore, mote.pop * 0.6);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, 8 + (1 - mote.pop) * 16, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }
    const pulse = reduced ? 1 : 0.85 + Math.sin(world.clock * 5 + mote.x * 0.05) * 0.15;
    ctx.fillStyle = alpha(PALETTE.screenCore, 0.9);
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, 4 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = alpha(PALETTE.screen, 0.3 * pulse);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, 9 * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/* --------------------------------------------------------- the player */

function drawTrail(ctx: CanvasRenderingContext2D, world: World): void {
  for (const point of world.trail) {
    // 1 at the player, 0 at the oldest sample still alive.
    const t = 1 - point.age / TRAIL_LIFE;
    if (t <= 0) continue;
    // The sample was left at the player's x; the route has carried it back
    // since, at exactly the speed everything else travels.
    const x = PLAYER_X - point.age * FORWARD_SPEED;
    ctx.fillStyle = alpha(PALETTE.amber, t * t * 0.34);
    ctx.beginPath();
    ctx.arc(x, point.y, 1 + t * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  world: World,
  status: GameStatus,
  reduced: boolean,
): void {
  // Before the first flap the mark hovers, so the stage is never a still
  // picture of a game waiting to be told to start.
  //
  // Driven off the wall clock, not `world.clock`: the world clock only
  // advances while the game is playing, which is exactly when this is not
  // wanted, so reading it here held the mark perfectly still.
  const hover = status === 'ready' && !reduced ? Math.sin(performance.now() / 380) * 6 : 0;
  // A flap squashes the mark along its own vertical, which is what sells the
  // beat as effort rather than as teleporting upward.
  const beat = 1 - world.beat * 0.16;

  ctx.save();
  ctx.translate(PLAYER_X, world.playerY + hover);
  ctx.rotate(world.tilt);
  ctx.scale(1, beat);

  if (!reduced) {
    ctx.shadowColor = alpha(PALETTE.amber, world.inDraft ? 0.75 : 0.45);
    ctx.shadowBlur = world.inDraft ? 26 : 14;
  }
  drawLogoMark(ctx, PLAYER_SIZE);
  ctx.restore();
}

/* --------------------------------------------------------- the ground */

function drawGround(ctx: CanvasRenderingContext2D, world: World, reduced: boolean): void {
  const h = VIEW_H - GROUND_Y;
  const floor = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW_H);
  floor.addColorStop(0, '#4a2c15');
  floor.addColorStop(0.18, '#2c1a0d');
  floor.addColorStop(1, '#100a05');
  ctx.fillStyle = floor;
  ctx.fillRect(0, GROUND_Y, WORLD_W, h);

  ctx.strokeStyle = alpha(PALETTE.amber, 0.3);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 0.5);
  ctx.lineTo(WORLD_W, GROUND_Y + 0.5);
  ctx.stroke();

  if (reduced) return;
  // Boards running past, at the route's own speed. This is the only cue that
  // the world is moving when the player is holding a level line.
  const step = 68;
  const offset = ((world.clock * 212) % step + step) % step;
  ctx.strokeStyle = alpha(PALETTE.void, 0.5);
  ctx.lineWidth = 2;
  for (let x = -offset; x < WORLD_W + step; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 4);
    ctx.lineTo(x - 14, VIEW_H);
    ctx.stroke();
  }
}
