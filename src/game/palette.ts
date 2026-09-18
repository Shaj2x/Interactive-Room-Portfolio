/**
 * The arcade's drawing palette and a few shared primitives.
 *
 * These are the same values as `src/styles/tokens.css`. The canvas cannot read
 * CSS custom properties cheaply per frame, so they are mirrored here — if a
 * token changes, change it in both places.
 */
export const PALETTE = {
  void: '#04060a',
  ink: '#070b12',
  navy: '#0c1622',
  navyHi: '#132234',
  /** The player, and anything the player directly drives. */
  amber: '#ffb567',
  amberDeep: '#8a4f1c',
  /** System, opponent, live state. */
  teal: '#5fe7e0',
  tealDim: '#2b8c8c',
  screen: '#bfe4ff',
  screenCore: '#eaf6ff',
  text: '#dfe9f4',
  textDim: '#93a5b8',
  faint: '#5d7086',
} as const;

export const FONT_DISPLAY = "'Instrument Serif', Georgia, 'Times New Roman', serif";
export const FONT_MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
export const FONT_BODY = "'Inter', system-ui, -apple-system, sans-serif";

/** `#rrggbb` plus an alpha, as an rgba() string. */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Runs `draw` with a coloured shadow, then puts the shadow back. */
export function withGlow(
  ctx: CanvasRenderingContext2D,
  colour: string,
  blur: number,
  draw: () => void,
): void {
  ctx.save();
  ctx.shadowColor = colour;
  ctx.shadowBlur = blur;
  draw();
  ctx.restore();
}

/** The dark glass every stage sits on: deep vignette over a cool base. */
export function paintStageBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.fillStyle = PALETTE.void;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, Math.max(w, h) * 0.75);
  glow.addColorStop(0, alpha(PALETTE.navyHi, 0.85));
  glow.addColorStop(1, alpha(PALETTE.void, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

/** Small uppercase mono label, the arcade's utility voice. */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  colour: string,
  align: CanvasTextAlign = 'left',
): void {
  ctx.save();
  ctx.font = `${size}px ${FONT_MONO}`;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  // Canvas has no letter-spacing everywhere yet, so space it by hand.
  const spaced = text.split('').join(' ');
  ctx.fillText(spaced, x, y);
  ctx.restore();
}

/**
 * A short-lived spark. Used for paddle contact, food collection and landings —
 * always restrained, and suppressed entirely under reduced motion.
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  colour: string;
  size: number;
}

export function stepParticles(particles: Particle[], dt: number, drag = 1.6): void {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const damp = Math.max(0, 1 - drag * dt);
    p.vx *= damp;
    p.vy *= damp;
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const t = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = t;
    ctx.fillStyle = p.colour;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function spawnBurst(
  particles: Particle[],
  x: number,
  y: number,
  count: number,
  colour: string,
  speed = 160,
): void {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.35 + Math.random() * 0.8);
    const life = 0.25 + Math.random() * 0.35;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life,
      maxLife: life,
      colour,
      size: 1.2 + Math.random() * 1.8,
    });
  }
}
