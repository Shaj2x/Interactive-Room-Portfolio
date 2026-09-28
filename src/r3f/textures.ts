import { CanvasTexture, SRGBColorSpace } from 'three';

/** Deterministic random, so the city and the corkboard look the same every load. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Procedural textures are drawn once into a canvas; no image files to ship. */
export function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d')!, w, h);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function drawCity(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rand = seeded(7);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#060a12');
  sky.addColorStop(0.6, '#0f1c2e');
  sky.addColorStop(1, '#1a2a3c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Two rows of towers: far and pale, near and dark.
  for (const [row, tone] of [
    [0, '#0d1520'],
    [1, '#070b12'],
  ] as const) {
    let x = -20;
    while (x < w) {
      const bw = 40 + rand() * 90;
      const bh = h * (row ? 0.25 + rand() * 0.35 : 0.4 + rand() * 0.4);
      ctx.fillStyle = tone;
      ctx.fillRect(x, h - bh, bw, bh);
      for (let wy = h - bh + 10; wy < h - 8; wy += 14) {
        for (let wx = x + 6; wx < x + bw - 8; wx += 12) {
          if (rand() > 0.82) {
            ctx.fillStyle = rand() > 0.3 ? 'rgba(255,190,120,0.75)' : 'rgba(170,215,255,0.6)';
            ctx.fillRect(wx, wy, 5, 7);
          }
        }
      }
      x += bw + rand() * 12;
    }
  }
}

export function drawPoster(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#0f2a2e';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#5fe7e0';
  ctx.globalAlpha = 0.85;
  ctx.font = `italic ${h * 0.2}px Georgia, serif`;
  ctx.fillText('Shipped', w * 0.08, h * 0.28);
  ctx.globalAlpha = 1;
  // Six tiles for six projects.
  const rand = seeded(3);
  for (let i = 0; i < 6; i++) {
    const cx = w * 0.08 + (i % 3) * w * 0.29;
    const cy = h * 0.4 + Math.floor(i / 3) * h * 0.27;
    ctx.fillStyle = `hsl(${180 + rand() * 40}, 35%, ${18 + rand() * 18}%)`;
    ctx.fillRect(cx, cy, w * 0.25, h * 0.22);
  }
}

export function drawCork(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rand = seeded(11);
  ctx.fillStyle = '#6b4a2c';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = rand() > 0.5 ? 'rgba(40,25,10,0.35)' : 'rgba(150,110,70,0.3)';
    ctx.fillRect(rand() * w, rand() * h, 2, 2);
  }
  const cards = ['#e9e1cf', '#cfe3e6', '#efe6b0', '#e8d2c8'];
  cards.forEach((c, i) => {
    ctx.save();
    ctx.translate(w * (0.18 + (i % 2) * 0.45 + rand() * 0.1), h * (0.25 + Math.floor(i / 2) * 0.45));
    ctx.rotate((rand() - 0.5) * 0.2);
    ctx.fillStyle = c;
    ctx.fillRect(-w * 0.15, -h * 0.15, w * 0.3, h * 0.3);
    ctx.fillStyle = 'rgba(40,40,50,0.5)';
    for (let l = 0; l < 4; l++) ctx.fillRect(-w * 0.12, -h * 0.08 + l * h * 0.05, w * (0.12 + rand() * 0.12), 3);
    ctx.fillStyle = '#b8322a';
    ctx.beginPath();
    ctx.arc(0, -h * 0.13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
