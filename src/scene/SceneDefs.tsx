/**
 * All light, colour and surface for the room, in one place.
 *
 * The lighting hierarchy, which everything else follows:
 *   KEY    — the laptop, warm cream-amber. The brightest thing in the frame.
 *   WARM   — candles and the strip of light under the door, same family as key.
 *   COOL   — the phone screen and the window. The only cool light, and the
 *            contrast that stops the warm reading as a sepia wash.
 *   ACCENT — cyan, and cyan is reserved for interactive glow. Never decorative.
 *
 * Every filter sets sRGB interpolation: SVG defaults to linearRGB, which
 * converts the whole filter region in and out of linear space on every pass for
 * no visible gain here.
 */
export function SceneDefs() {
  return (
    <defs>
      {/* --- Surfaces ------------------------------------------------------ */}
      <linearGradient id="g-wall" x1="0.1" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor="#0d0b0a" />
        <stop offset="40%" stopColor="#1a1613" />
        <stop offset="100%" stopColor="#0b0a09" />
      </linearGradient>

      <linearGradient id="g-floor" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="#14100c" />
        <stop offset="100%" stopColor="#060504" />
      </linearGradient>

      {/* Warm pale wood — the desk and the bookshelf. */}
      <linearGradient id="g-wood" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="#6b4e32" />
        <stop offset="45%" stopColor="#4a3521" />
        <stop offset="100%" stopColor="#2c1f14" />
      </linearGradient>
      <linearGradient id="g-wood-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34251696" />
        <stop offset="100%" stopColor="#1a120b" />
      </linearGradient>

      <linearGradient id="g-cork" x1="0.1" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#8a6134" />
        <stop offset="55%" stopColor="#5f4123" />
        <stop offset="100%" stopColor="#3a2716" />
      </linearGradient>

      {/* Heavy curtain, deep olive-brown, falling into black. */}
      <linearGradient id="g-curtain" x1="0" y1="0" x2="1" y2="0.2">
        <stop offset="0%" stopColor="#100d0a" />
        <stop offset="40%" stopColor="#241d14" />
        <stop offset="100%" stopColor="#0a0806" />
      </linearGradient>

      {/* --- KEY LIGHT: the laptop, warm ------------------------------------ */}
      <linearGradient id="g-key" x1="0.1" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#fff2dc" />
        <stop offset="45%" stopColor="#ffd9a4" />
        <stop offset="100%" stopColor="#d99a52" />
      </linearGradient>

      <radialGradient id="g-key-bloom" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#ffd9a4" stopOpacity="0.62" />
        <stop offset="42%" stopColor="#e0a35c" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#8a4f1c" stopOpacity="0" />
      </radialGradient>

      {/* --- WARM: candles, the door strip ---------------------------------- */}
      <radialGradient id="g-candle-bloom" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#ffca80" stopOpacity="0.5" />
        <stop offset="38%" stopColor="#e8923c" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#7a3f14" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="g-wax" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f0dcb8" stopOpacity="0.45" />
        <stop offset="45%" stopColor="#c9a276" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#2a2018" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="g-doorstrip" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffd9a4" stopOpacity="0" />
        <stop offset="45%" stopColor="#ffcf90" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#ffd9a4" stopOpacity="0" />
      </linearGradient>

      {/* --- COOL: the phone and the window --------------------------------- */}
      <radialGradient id="g-cool-bloom" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#bfe0f5" stopOpacity="0.5" />
        <stop offset="45%" stopColor="#6f9fc8" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#2e4f6e" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="g-sky" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="#0c1622" />
        <stop offset="55%" stopColor="#14202e" />
        <stop offset="100%" stopColor="#1b2632" />
      </linearGradient>
      <linearGradient id="g-raindrop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#cfe6f8" stopOpacity="0" />
        <stop offset="70%" stopColor="#cfe6f8" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#eaf6ff" stopOpacity="0.9" />
      </linearGradient>

      {/* Falloff at the edges of the room. Gradients, never blurred rectangles
          — a blurred rectangle still ends somewhere, and that edge reads as a
          bar across the frame. */}
      <linearGradient id="g-ceiling-fall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#040303" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#040303" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="g-floor-fall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050403" stopOpacity="0" />
        <stop offset="100%" stopColor="#050403" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="g-side-fall" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#040303" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#040303" stopOpacity="0" />
      </linearGradient>

      {/* --- Filters -------------------------------------------------------- */}
      <filter id="f-bloom-lg" colorInterpolationFilters="sRGB" x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur stdDeviation="24" />
      </filter>
      <filter id="f-bloom-sm" colorInterpolationFilters="sRGB" x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
      <filter id="f-soft" colorInterpolationFilters="sRGB" x="-15%" y="-15%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <filter id="f-dof" colorInterpolationFilters="sRGB" x="-6%" y="-6%" width="112%" height="112%">
        <feGaussianBlur stdDeviation="1.9" />
      </filter>
      <filter id="f-fore-blur" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="14" />
      </filter>

      {/* Painterly edges. Turbulence displaces every edge by a few pixels, so a
          straight line wanders the way a drawn one does. Two octaves: the extra
          detail was not visible at this displacement and cost real frames. */}
      <filter id="f-paint" colorInterpolationFilters="sRGB" x="-3%" y="-3%" width="106%" height="106%">
        <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="0.7" />
      </filter>
      <filter id="f-paint-fine" colorInterpolationFilters="sRGB" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.024" numOctaves="2" seed="5" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="0.45" />
      </filter>

      <clipPath id="clip-stage">
        <rect x="0" y="0" width="1600" height="900" />
      </clipPath>
    </defs>
  );
}
