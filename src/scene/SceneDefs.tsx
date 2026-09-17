/**
 * All gradients, filters and light sources for the room, in one place.
 * Referenced by id from the layer components.
 */
export function SceneDefs() {
  return (
    <defs>
      {/* --- Surfaces ------------------------------------------------------ */}
      <linearGradient id="g-wall" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor="#0a0c10" />
        <stop offset="45%" stopColor="#15181d" />
        <stop offset="100%" stopColor="#0a0b0f" />
      </linearGradient>

      <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#120f0d" />
        <stop offset="100%" stopColor="#050506" />
      </linearGradient>

      <linearGradient id="g-desk" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stopColor="#27394a" />
        <stop offset="45%" stopColor="#182734" />
        <stop offset="100%" stopColor="#101c26" />
      </linearGradient>

      <linearGradient id="g-desk-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#16232f" />
        <stop offset="100%" stopColor="#070d14" />
      </linearGradient>

      <linearGradient id="g-shelf" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stopColor="#0a131c" />
        <stop offset="100%" stopColor="#13202c" />
      </linearGradient>

      {/* --- Key light: the laptop screen ---------------------------------- */}
      <linearGradient id="g-screen" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stopColor="#d8efff" />
        <stop offset="40%" stopColor="#8fd2f5" />
        <stop offset="100%" stopColor="#2f6f9e" />
      </linearGradient>

      <radialGradient id="g-screen-bloom" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#bfe4ff" stopOpacity="0.55" />
        <stop offset="45%" stopColor="#6fb6e6" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#2e6f9e" stopOpacity="0" />
      </radialGradient>

      {/* --- Secondary warm: the desk lamp --------------------------------- */}
      <radialGradient id="g-lamp-bloom" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#ffb567" stopOpacity="0.42" />
        <stop offset="50%" stopColor="#c87b33" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#8a4f1c" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="g-lamp-cone" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#ffc890" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#ffb567" stopOpacity="0" />
      </linearGradient>

      {/* --- Candles -------------------------------------------------------- */}
      <radialGradient id="g-candle-bloom" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#ffca80" stopOpacity="0.5" />
        <stop offset="38%" stopColor="#e8923c" stopOpacity="0.17" />
        <stop offset="100%" stopColor="#7a3f14" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="g-wax" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f0dcb8" stopOpacity="0.5" />
        <stop offset="45%" stopColor="#c9a276" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#2a2018" stopOpacity="0.1" />
      </linearGradient>

      {/* A broad warm wash over the room, so the walls read as candlelit
          rather than only screen-lit. */}
      <radialGradient id="g-warm-wash" cx="0.32" cy="0.62" r="0.62">
        <stop offset="0%" stopColor="#ffa858" stopOpacity="0.2" />
        <stop offset="52%" stopColor="#c47234" stopOpacity="0.075" />
        <stop offset="100%" stopColor="#6d3a16" stopOpacity="0" />
      </radialGradient>

      {/* --- Door light leak ------------------------------------------------ */}
      <linearGradient id="g-doorleak" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#ffc287" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#ffb567" stopOpacity="0" />
      </linearGradient>

      {/* --- Window --------------------------------------------------------- */}
      <linearGradient id="g-window" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#16303f" />
        <stop offset="60%" stopColor="#0d1e2b" />
        <stop offset="100%" stopColor="#081520" />
      </linearGradient>

      {/* Rain streaks: a drop with a tail, not a flat line. */}
      <linearGradient id="g-raindrop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bfe0f5" stopOpacity="0" />
        <stop offset="70%" stopColor="#bfe0f5" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#e6f4ff" stopOpacity="0.95" />
      </linearGradient>

      {/* --- Blur / bloom filters ------------------------------------------- */}
      <filter id="f-bloom-lg" colorInterpolationFilters="sRGB" x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur stdDeviation="24" />
      </filter>
      <filter id="f-bloom-sm" colorInterpolationFilters="sRGB" x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
      <filter id="f-soft" colorInterpolationFilters="sRGB" x="-15%" y="-15%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <filter id="f-fore-blur" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="14" />
      </filter>

      {/* Haze in the light beam. This was turbulence + displacement + blur and
          it was animated, so it re-ran every frame; at this size a plain blur
          is indistinguishable. */}
      <filter id="f-haze" colorInterpolationFilters="sRGB" x="-15%" y="-15%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="14" />
      </filter>

      <linearGradient id="g-ceiling-fall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#04050a" stopOpacity="0.92" />
        <stop offset="60%" stopColor="#05070c" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#05070c" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="g-floor-fall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#07060a" stopOpacity="0" />
        <stop offset="100%" stopColor="#07060a" stopOpacity="0.72" />
      </linearGradient>

      {/* --- Painterly rendering --------------------------------------------
          What makes vector art read as vector art is the edges: mathematically
          exact, identical along their whole length. These filters break that
          up. Turbulence displaces every edge by a few pixels at a low
          frequency, so a straight line wanders the way a drawn one does, and a
          light blur stops the result looking like torn paper. */}
      <filter id="f-paint" colorInterpolationFilters="sRGB" x="-3%" y="-3%" width="106%" height="106%">
        <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="0.7" />
      </filter>

      {/* Same idea, gentler — for objects near the camera, which should stay
          crisper than the far wall. */}
      <filter id="f-paint-fine" colorInterpolationFilters="sRGB" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.024" numOctaves="2" seed="5" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="0.45" />
      </filter>

      {/* Depth of field: the far wall sits slightly out of focus, which is what
          a camera in a small room would actually do. */}
      <filter id="f-dof" colorInterpolationFilters="sRGB" x="-6%" y="-6%" width="112%" height="112%">
        <feGaussianBlur stdDeviation="1.9" />
      </filter>

      {/* Plaster. Coarse mottling across the wall so it is a painted surface
          with history rather than a clean gradient. */}
      <filter id="f-plaster" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="5" seed="23" result="t" />
        <feColorMatrix
          in="t"
          type="matrix"
          values="0 0 0 0 0.62
                  0 0 0 0 0.45
                  0 0 0 0 0.30
                  0 0 0 0.5 0"
        />
      </filter>

      {/* Brush drag: streaky, directional noise for the wall's light pools. */}
      <filter id="f-brush" colorInterpolationFilters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.05" numOctaves="3" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="9" />
      </filter>

      {/* Masks the bloom so the glow does not bleed past the wall. */}
      <clipPath id="clip-stage">
        <rect x="0" y="0" width="1600" height="900" />
      </clipPath>
    </defs>
  );
}
