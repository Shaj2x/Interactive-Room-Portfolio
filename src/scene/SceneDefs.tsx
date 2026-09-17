/**
 * All gradients, filters and light sources for the room, in one place.
 * Referenced by id from the layer components.
 */
export function SceneDefs() {
  return (
    <defs>
      {/* --- Surfaces ------------------------------------------------------ */}
      <linearGradient id="g-wall" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor="#060a10" />
        <stop offset="55%" stopColor="#0b1520" />
        <stop offset="100%" stopColor="#060910" />
      </linearGradient>

      <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a121c" />
        <stop offset="100%" stopColor="#03060a" />
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

      {/* --- Blur / bloom filters ------------------------------------------- */}
      <filter id="f-bloom-lg" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="34" />
      </filter>
      <filter id="f-bloom-sm" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
      <filter id="f-soft" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <filter id="f-fore-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="14" />
      </filter>

      {/* Haze in the light beam: turbulence, not a bitmap. */}
      <filter id="f-haze" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="3" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="26" />
        <feGaussianBlur stdDeviation="16" />
      </filter>

      {/* Masks the bloom so the glow does not bleed past the wall. */}
      <clipPath id="clip-stage">
        <rect x="0" y="0" width="1600" height="900" />
      </clipPath>
    </defs>
  );
}
