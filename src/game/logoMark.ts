import { FONT_DISPLAY, PALETTE, alpha, roundRect } from './palette';

/**
 * The mark the player flies in Updraft.
 *
 * ## Swapping in the real logo
 *
 * Set `LOGO_SRC` below to the logo's URL and nothing else has to change — the
 * game asks for a square of `size` and gets one either way. Two ways to supply
 * it, and the second is the one to use:
 *
 * ```ts
 * // public/, stable filename, no hashing:
 * const LOGO_SRC: string | null = `${import.meta.env.BASE_URL}logo.png`;
 *
 * // or src/assets/, hashed and fingerprinted by Vite — preferred, because a
 * // missing file then fails the build instead of failing in front of a visitor:
 * import logoUrl from '../assets/logo.png';
 * const LOGO_SRC: string | null = logoUrl;
 * ```
 *
 * Until then this draws a monogram. It is a stand-in, not the logo: the real
 * one lived at `/manus-storage/shajith-logo-transparent_5b92de05.png` in the
 * previous hosting environment and never made it into this repository. See
 * ASSETS.md.
 *
 * `null` is deliberate rather than pointing at a file that might not be there.
 * A 404 on every run would sit in the console of a portfolio, and the failed
 * request would cost a round trip before the fallback drew anyway.
 */
const LOGO_SRC: string | null = null;

/**
 * Loaded once for the page, not once per game.
 *
 * A run creates a new game object every time the cabinet is opened, and an
 * `Image` per run would re-decode the same file. `decoding: 'async'` keeps the
 * decode off the frame that first draws it.
 */
let sprite: HTMLImageElement | null = null;
let spriteReady = false;

function ensureSprite(): void {
  if (sprite || !LOGO_SRC) return;
  const image = new Image();
  image.decoding = 'async';
  // A logo that fails to load leaves `spriteReady` false, and the monogram
  // keeps drawing. The game never waits on the network.
  image.onload = () => {
    spriteReady = image.naturalWidth > 0;
  };
  image.src = LOGO_SRC;
  sprite = image;
}

/**
 * Draws the mark centred on the current origin, filling a `size` square.
 *
 * The caller owns the transform: Updraft translates to the player and rotates
 * by its tilt before calling, so the mark banks with the flight.
 */
export function drawLogoMark(ctx: CanvasRenderingContext2D, size: number): void {
  ensureSprite();
  if (spriteReady && sprite) {
    const half = size / 2;
    ctx.drawImage(sprite, -half, -half, size, size);
    return;
  }
  drawMonogram(ctx, size);
}

/**
 * The stand-in: a warm token with an S set in the site's own display face.
 *
 * Drawn rather than loaded so it costs nothing and stays sharp at any size.
 * It is a filled token rather than a bare letterform on purpose — at the 34
 * units the player occupies, a hairline glyph would read as a smudge, and the
 * player has to be legible against a pillar at speed.
 *
 * The letter is typeset rather than drawn as arcs: hand-built curves at this
 * size come out as a shape that is nearly an S, and the page has already
 * loaded Bricolage by the time anyone opens the arcade.
 */
function drawMonogram(ctx: CanvasRenderingContext2D, size: number): void {
  const s = size;
  const half = s / 2;

  const body = ctx.createLinearGradient(-half, -half, half, half);
  body.addColorStop(0, PALETTE.amber);
  body.addColorStop(1, PALETTE.amberDeep);
  ctx.fillStyle = body;
  roundRect(ctx, -half, -half, s, s, s * 0.28);
  ctx.fill();

  // A lit top edge, so it reads as an object under the same lamp as the room.
  ctx.strokeStyle = alpha(PALETTE.screenCore, 0.45);
  ctx.lineWidth = s * 0.045;
  roundRect(ctx, -half + s * 0.03, -half + s * 0.03, s - s * 0.06, s - s * 0.06, s * 0.25);
  ctx.stroke();

  ctx.fillStyle = PALETTE.void;
  ctx.font = `700 ${s * 0.72}px ${FONT_DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Optical centring: a capital S sits high on the baseline-to-cap-height box.
  ctx.fillText('S', 0, s * 0.03);
}
