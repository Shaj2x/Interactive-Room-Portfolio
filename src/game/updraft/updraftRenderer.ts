import type { GameContext, GameStatus } from '../arcadeTypes';
import { letterbox } from '../gameLoop';
import {
  alpha,
  drawLabel,
  drawParticles,
  PALETTE,
  roundRect,
  withGlow,
} from '../palette';
import { METRE, PLAYER_H, PLAYER_W, START_Y, VIEW_H, WORLD_W } from './constants';
import type { UpdraftWorld as World } from './UpdraftGame';

export function renderUpdraft(
  ctx: CanvasRenderingContext2D,
  view: GameContext,
  world: World,
  status: GameStatus,
): void {
  const box = letterbox(view, WORLD_W, VIEW_H);
  if (box.scale <= 0) return;

  // The sky fills the whole stage; the route is clipped to the world column,
  // so the pillarbox reads as atmosphere rather than as dead space.
  drawSky(ctx, view, world);

  ctx.save();
  ctx.translate(box.offsetX, box.offsetY);
  ctx.scale(box.scale, box.scale);
  ctx.beginPath();
  ctx.rect(0, 0, WORLD_W, VIEW_H);
  ctx.clip();

  // World space: subtracting the camera puts world y on screen y.
  ctx.save();
  ctx.translate(0, -world.cameraY);

  drawWinds(ctx, world, view.reducedMotion);
  drawPlatforms(ctx, world, view.reducedMotion);
  drawMotes(ctx, world, view.reducedMotion);
  if (!view.reducedMotion) drawTrail(ctx, world);
  drawPlayer(ctx, world, status);
  drawParticles(ctx, world.particles);

  ctx.restore();

  drawAltimeter(ctx, world);
  ctx.restore();
}

/**
 * The sky gradient, rebuilt only when it would actually look different.
 *
 * It depends on the viewport and on how far the player has climbed, and the
 * climb term moves slowly — quantising it to 32 steps means the gradient is
 * built a handful of times per run instead of sixty times a second.
 */
let skyCache: { key: string; gradient: CanvasGradient } | null = null;

function skyGradient(ctx: CanvasRenderingContext2D, height: number, tier: number): CanvasGradient {
  const key = `${height}:${tier}`;
  if (skyCache && skyCache.key === key) return skyCache.gradient;
  const t = tier / 32;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, mix(PALETTE.navy, '#020409', 0.25 + t * 0.55));
  sky.addColorStop(0.55, mix(PALETTE.ink, '#050b16', 0.3));
  sky.addColorStop(1, mix('#0d1a28', PALETTE.void, t * 0.5));
  skyCache = { key, gradient: sky };
  return sky;
}

/** Vertical atmospheric gradient that deepens with altitude. */
function drawSky(ctx: CanvasRenderingContext2D, view: GameContext, world: World): void {
  const climbed = Math.max(0, START_Y - world.peakY) / METRE;
  // 0 at the ground, 1 by 900m: the air thins and cools as you climb.
  const tier = Math.round(Math.min(1, climbed / 900) * 32);

  ctx.fillStyle = skyGradient(ctx, view.height, tier);
  ctx.fillRect(0, 0, view.width, view.height);

  // Thin cloud bands, parallaxed against the camera so the climb has depth.
  ctx.save();
  for (let i = 0; i < 5; i += 1) {
    const depth = 0.12 + i * 0.07;
    const band = ((world.cameraY * depth + i * 220) % 420 + 420) % 420;
    const y = view.height - band * (view.height / 420);
    ctx.fillStyle = alpha(PALETTE.screen, 0.028 + i * 0.006);
    ctx.fillRect(0, y, view.width, 26 + i * 8);
  }
  ctx.restore();
}

/**
 * Wind is drawn before it bites. The zone itself is a tinted band with moving
 * streaks; below it — the side the climber arrives from — sits a fainter
 * telegraph band with arrows, so a gust is never a surprise.
 */
function drawWinds(ctx: CanvasRenderingContext2D, world: World, reduced: boolean): void {
  for (const zone of world.winds) {
    const height = zone.yBottom - zone.yTop;
    const direction = Math.sign(zone.strength) || 1;
    const intensity = Math.min(1, Math.abs(zone.strength) / 100);

    const tint = ctx.createLinearGradient(0, zone.yTop, 0, zone.yBottom);
    tint.addColorStop(0, alpha(PALETTE.teal, 0));
    tint.addColorStop(0.5, alpha(PALETTE.teal, 0.07 + intensity * 0.05));
    tint.addColorStop(1, alpha(PALETTE.teal, 0));
    ctx.fillStyle = tint;
    ctx.fillRect(0, zone.yTop, WORLD_W, height);

    // Streaks inside the zone, drifting the way the wind pushes.
    const drift = reduced ? 0 : (world.clock * 120 * direction) % WORLD_W;
    ctx.strokeStyle = alpha(PALETTE.teal, 0.2 + intensity * 0.16);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 9; i += 1) {
      const y = zone.yTop + ((i + 0.5) / 9) * height;
      const x = (((i * 137 + drift) % WORLD_W) + WORLD_W) % WORLD_W;
      const len = 48 + intensity * 46;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len * direction, y);
      ctx.stroke();
    }

    // Telegraph: the approach side, before the zone has any effect.
    const warnY = zone.yBottom;
    ctx.save();
    ctx.globalAlpha = 0.5;
    drawLabel(
      ctx,
      direction > 0 ? 'WIND →' : '← WIND',
      WORLD_W / 2,
      warnY + 34,
      12,
      alpha(PALETTE.teal, 0.8),
      'center',
    );
    ctx.strokeStyle = alpha(PALETTE.teal, 0.22);
    ctx.setLineDash([6, 10]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, warnY);
    ctx.lineTo(WORLD_W, warnY);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  world: World,
  reduced: boolean,
): void {
  const thickness = 12;
  const top = world.cameraY - thickness;
  const bottom = world.cameraY + VIEW_H + thickness;

  for (const platform of world.platforms) {
    // Vertical cull. The route extends a screen above and below the camera, so
    // without this a third of the draws are for platforms nobody can see.
    if (platform.y < top || platform.y > bottom) continue;

    // `shadowBlur` is the most expensive thing in this renderer, so it is spent
    // only where it reads: on the platform the player just hit. The rest get a
    // flat lit edge, which at this size is indistinguishable.
    const lit = !reduced && platform.flash > 0.01;

    // A platform crossing the seam is drawn twice so it is never clipped in half.
    for (const offset of [0, -WORLD_W, WORLD_W]) {
      const x = platform.x + offset;
      if (x > WORLD_W || x + platform.w < 0) continue;

      const body = () => {
        ctx.fillStyle = alpha(PALETTE.screen, 0.16 + platform.flash * 0.2);
        roundRect(ctx, x, platform.y - thickness / 2, platform.w, thickness, 5);
        ctx.fill();
      };
      if (lit) {
        withGlow(ctx, alpha(PALETTE.teal, 0.35 + platform.flash * 0.45), 10 + platform.flash * 26, body);
      } else {
        body();
      }

      // Lit top edge — the surface you actually land on.
      ctx.fillStyle = alpha(PALETTE.teal, 0.75 + platform.flash * 0.25);
      roundRect(ctx, x + 3, platform.y - thickness / 2, platform.w - 6, 2.4, 1.2);
      ctx.fill();
    }
  }
}

function drawMotes(ctx: CanvasRenderingContext2D, world: World, reduced: boolean): void {
  const top = world.cameraY - 20;
  const bottom = world.cameraY + VIEW_H + 20;
  for (const mote of world.motes) {
    if (mote.taken && mote.pop <= 0.01) continue;
    if (mote.y < top || mote.y > bottom) continue;
    const pulse = reduced ? 0.5 : 0.5 + Math.sin(world.clock * 5 + mote.x * 0.02) * 0.5;
    const scale = mote.taken ? 1 + (1 - mote.pop) * 1.4 : 1;
    const opacity = mote.taken ? mote.pop : 1;
    const r = 6 * scale;

    ctx.save();
    ctx.globalAlpha = opacity;
    withGlow(ctx, alpha(PALETTE.amber, 0.8), reduced ? 6 : 12 + pulse * 8, () => {
      ctx.fillStyle = PALETTE.amber;
      // A four-point spark, not a coin: it reads as charge in the air.
      ctx.beginPath();
      ctx.moveTo(mote.x, mote.y - r);
      ctx.lineTo(mote.x + r * 0.42, mote.y);
      ctx.lineTo(mote.x, mote.y + r);
      ctx.lineTo(mote.x - r * 0.42, mote.y);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }
}

function drawTrail(ctx: CanvasRenderingContext2D, world: World): void {
  const n = world.trail.length;
  for (let i = 0; i < n; i += 1) {
    const p = world.trail[i];
    // Skip the frame the player wrapped, or the trail streaks the whole width.
    if (i > 0 && Math.abs(p.x - world.trail[i - 1].x) > WORLD_W / 2) continue;
    const t = (i + 1) / n;
    ctx.globalAlpha = t * 0.28;
    ctx.fillStyle = PALETTE.amber;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, PLAYER_W * 0.3 * t, PLAYER_H * 0.34 * t, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx: CanvasRenderingContext2D, world: World, status: GameStatus): void {
  // Squash on landing, stretch on the way up: the whole readability of the jump.
  const squash = world.squash;
  const stretch = Math.max(-0.25, Math.min(0.25, -world.vy / 2600));
  const w = PLAYER_W * (1 + squash * 0.35 - stretch);
  const h = PLAYER_H * (1 - squash * 0.3 + stretch);
  // Lean into the wind, so the weather is legible on the silhouette.
  const lean = Math.max(-0.4, Math.min(0.4, (world.vx - 195) / 220));

  for (const offset of [0, -WORLD_W, WORLD_W]) {
    const x = world.playerX + offset;
    if (x < -60 || x > WORLD_W + 60) continue;

    ctx.save();
    ctx.translate(x, world.playerY);
    ctx.rotate(lean * 0.35);

    withGlow(ctx, alpha(PALETTE.amber, 0.7), 18, () => {
      ctx.fillStyle = status === 'lost' ? PALETTE.amberDeep : PALETTE.amber;
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Wings, angled by vertical speed — open on the climb, tucked on the fall.
    const wing = Math.max(-1, Math.min(1, -world.vy / 700));
    ctx.strokeStyle = alpha(PALETTE.screenCore, 0.75);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * w * 0.36, -h * 0.05);
      ctx.lineTo(side * w * 0.92, -h * 0.05 - wing * h * 0.4);
      ctx.stroke();
    }

    ctx.fillStyle = PALETTE.void;
    ctx.beginPath();
    ctx.arc(w * 0.16, -h * 0.14, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** A quiet altitude scale up the left edge of the column. */
function drawAltimeter(ctx: CanvasRenderingContext2D, world: World): void {
  const step = 50 * METRE;
  const top = world.cameraY;
  const first = Math.ceil(top / step) * step;

  ctx.save();
  for (let y = first; y < top + VIEW_H; y += step) {
    const screenY = y - world.cameraY;
    if (screenY < 16 || screenY > VIEW_H - 16) continue;
    const metres = Math.round((START_Y - y) / METRE);
    if (metres <= 0) continue;
    ctx.strokeStyle = alpha(PALETTE.screen, 0.1);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, screenY);
    ctx.lineTo(30, screenY);
    ctx.stroke();
    drawLabel(ctx, `${metres}`, 36, screenY, 10, alpha(PALETTE.faint, 0.75), 'left');
  }
  ctx.restore();
}

/** Blends two hex colours. Used only for the sky, which shifts with altitude. */
function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number): number =>
    Math.round((((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}
