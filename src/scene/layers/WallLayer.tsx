/**
 * The back wall, depth 0.15 — furthest plane, so it takes the least parallax.
 *
 * Composition, left to right: corkboard, sticky notes, the framed print above
 * the bookshelf, the window onto the city, and the strip of warm light at the
 * door. Four of those are hotspots; the window is ambient only.
 */

/* Pinned to the corkboard. Kept to the left of the figure's head so the
   hotspot is never behind him. */
const PINNED = [
  { x: 26, y: 52, w: 64, h: 78, r: -5, tint: '#2b3540' },
  { x: 104, y: 44, w: 58, h: 72, r: 4, tint: '#3a2f28' },
  { x: 176, y: 58, w: 62, h: 76, r: -3, tint: '#2e3a34' },
  { x: 20, y: 156, w: 70, h: 84, r: 3, tint: '#38302a' },
  { x: 106, y: 168, w: 60, h: 74, r: -6, tint: '#2a323c' },
  { x: 180, y: 160, w: 58, h: 70, r: 5, tint: '#3b3128' },
];

const STICKIES = [
  { x: 322, y: 126, s: 54, r: -5, fill: '#3b3620' },
  { x: 388, y: 136, s: 50, r: 6, fill: '#34301c' },
  { x: 330, y: 194, s: 52, r: 4, fill: '#383322' },
  { x: 394, y: 202, s: 48, r: -7, fill: '#2f2b1e' },
];

/* The city. Buildings first, then lit windows over them — warm and cool
   mixed, because a skyline all one temperature reads as a texture. */
const TOWERS = [
  { x: 902, w: 58, top: 176 }, { x: 966, w: 42, top: 132 },
  { x: 1012, w: 66, top: 206 }, { x: 1082, w: 38, top: 98 },
  { x: 1124, w: 54, top: 162 }, { x: 1182, w: 46, top: 122 },
  { x: 1232, w: 62, top: 190 }, { x: 938, w: 24, top: 108 },
  { x: 1160, w: 18, top: 86 }, { x: 1296, w: 40, top: 152 },
];

const CITY_LIGHTS = Array.from({ length: 86 }, (_, i) => {
  const t = TOWERS[i % TOWERS.length];
  const col = i % 7;
  return {
    x: t.x + 5 + ((i * 13) % Math.max(1, t.w - 12)),
    y: t.top + 10 + ((i * 29) % 190),
    w: 3 + ((i * 5) % 4),
    h: 2 + ((i * 3) % 3),
    fill: col < 3 ? '#ffb861' : col < 5 ? '#cfe4f5' : col === 5 ? '#7fb8e8' : '#ff8d4a',
    o: 0.55 + ((i * 7) % 45) / 100,
    delay: (i * 0.31) % 7,
  };
});

const RAIN = Array.from({ length: 44 }, (_, i) => ({
  x: 902 + ((i * 59) % 396),
  delay: (i * 0.27) % 4.8,
  dur: 1.3 + ((i * 17) % 21) / 10,
  len: 20 + ((i * 13) % 40),
  w: 0.8 + ((i * 7) % 5) / 5,
}));

const RUNNELS = Array.from({ length: 12 }, (_, i) => ({
  x: 914 + ((i * 73) % 376),
  y: 30 + ((i * 47) % 250),
  r: 1.7 + ((i * 11) % 7) / 3,
  delay: (i * 0.91) % 9,
  dur: 5 + ((i * 19) % 41) / 5,
}));

export function WallLayer() {
  return (
    <g id="layer-wall">
      <rect x="0" y="0" width="1600" height="700" fill="url(#g-wall)" />
      <rect x="0" y="688" width="1600" height="212" fill="url(#g-floor)" />

      {/* Uneven paint. The fine plaster grain is <WallTexture>, a composited
          layer — as an SVG filter it was re-rasterised on every parallax frame. */}
      <g filter="url(#f-dof)" opacity="0.5">
        <ellipse cx="240" cy="260" rx="330" ry="240" fill="#2a1d12" />
        <ellipse cx="700" cy="180" rx="360" ry="200" fill="#16120e" />
        <ellipse cx="1180" cy="440" rx="380" ry="240" fill="#0f1319" />
        <ellipse cx="520" cy="560" rx="340" ry="190" fill="#31220f" />
      </g>

      {/* The key light, thrown back onto the wall from the laptop. */}
      <ellipse
        cx="520"
        cy="430"
        rx="400"
        ry="290"
        fill="url(#g-key-bloom)"
        opacity="0.42"
        filter="url(#f-bloom-lg)"
        className="key-bloom"
      />

      {/* ---------------- Corkboard → About -------------------------------- */}
      <g id="obj-corkboard" className="paintable" filter="url(#f-paint)">
        <rect x="4" y="22" width="296" height="330" rx="4" fill="url(#g-cork)" />
        <rect x="4" y="22" width="296" height="330" rx="4" fill="none" stroke="#3f2b16" strokeWidth="11" />
        {PINNED.map((p, i) => (
          <g key={i} transform={`rotate(${p.r} ${p.x + p.w / 2} ${p.y + p.h / 2})`}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#161311" />
            <rect x={p.x + 5} y={p.y + 5} width={p.w - 10} height={p.h - 22} fill={p.tint} />
            <circle cx={p.x + p.w / 2} cy={p.y + 4} r="3" fill="#8a6134" />
          </g>
        ))}
      </g>

      {/* ---------------- Sticky notes → Leadership ------------------------ */}
      <g id="obj-stickies" className="paintable" filter="url(#f-paint)">
        {STICKIES.map((s, i) => (
          <g key={i} transform={`rotate(${s.r} ${s.x + s.s / 2} ${s.y + s.s / 2})`}>
            <rect x={s.x} y={s.y} width={s.s} height={s.s} fill={s.fill} />
            <line x1={s.x + 9} y1={s.y + 18} x2={s.x + s.s - 9} y2={s.y + 18} stroke="#8d7f5e" strokeWidth="2" opacity="0.45" />
            <line x1={s.x + 9} y1={s.y + 30} x2={s.x + s.s - 16} y2={s.y + 30} stroke="#8d7f5e" strokeWidth="2" opacity="0.3" />
          </g>
        ))}
      </g>

      {/* ---------------- Framed print → Projects --------------------------- */}
      <g id="obj-poster" className="paintable" filter="url(#f-paint)">
        <rect x="608" y="18" width="192" height="146" fill="#0f0c0a" />
        <rect x="608" y="18" width="192" height="146" fill="none" stroke="#241a11" strokeWidth="9" />
        <rect x="624" y="22" width="160" height="134" fill="#141c26" />
        {/* A warm figure in a dark field — the print reads at a glance. */}
        <ellipse cx="704" cy="82" rx="34" ry="40" fill="#c8912f" opacity="0.75" />
        <path d="M660 156 C668 118 686 102 704 102 C722 102 740 118 748 156 Z" fill="#1d1c1a" />
      </g>

      {/* ---------------- Window (ambient only) ----------------------------- */}
      <g id="obj-window">
        <rect x="898" y="24" width="404" height="376" fill="url(#g-sky)" />
        <g clipPath="url(#clip-window)">
          <clipPath id="clip-window">
            <rect x="898" y="24" width="404" height="376" />
          </clipPath>
          {TOWERS.map((t, i) => (
            <rect key={i} x={t.x} y={t.top + 24} width={t.w} height={400 - t.top} fill="#0a1018" opacity="0.95" />
          ))}
          {CITY_LIGHTS.map((c, i) => (
            <rect
              key={`c${i}`}
              x={c.x}
              y={c.y + 24}
              width={c.w}
              height={c.h}
              fill={c.fill}
              opacity={c.o}
              className="city-light"
              style={{ animationDelay: `${c.delay}s` }}
            />
          ))}
          {/* Haze over the city, so it sits behind glass rather than on it. */}
          <rect x="898" y="150" width="404" height="250" fill="#1b2632" opacity="0.22" filter="url(#f-bloom-lg)" />
          {RAIN.map((d, i) => (
            <line
              key={`r${i}`}
              x1={d.x}
              y1="-40"
              x2={d.x - 7}
              y2={-40 + d.len}
              stroke="url(#g-raindrop)"
              strokeWidth={d.w}
              strokeLinecap="round"
              className="raindrop"
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
            />
          ))}
          {RUNNELS.map((d, i) => (
            <circle
              key={`u${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#cfe8f8"
              className="runnel"
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
            />
          ))}
        </g>

        {/* Frame, mullions and sill */}
        <rect x="898" y="24" width="404" height="376" fill="none" stroke="#1c1814" strokeWidth="10" />
        <line x1="1100" y1="24" x2="1100" y2="400" stroke="#1c1814" strokeWidth="8" />
        <line x1="898" y1="220" x2="1302" y2="220" stroke="#1c1814" strokeWidth="8" />
        <rect x="886" y="394" width="430" height="20" rx="3" fill="#231c15" />
        {/* The window's cool spill onto the wall below it. */}
        <ellipse cx="1100" cy="454" rx="260" ry="120" fill="url(#g-cool-bloom)" opacity="0.3" filter="url(#f-bloom-lg)" />

        {/* Curtains, drawn back, heavy. */}
        <path d="M852 12 L944 12 C922 142 926 280 948 448 L852 448 Z" fill="url(#g-curtain)" />
        <path d="M1256 12 L1352 12 L1352 448 L1252 448 C1276 280 1280 142 1256 12 Z" fill="url(#g-curtain)" />
        <rect x="846" y="10" width="512" height="14" fill="#15110d" />
      </g>

      {/* ---------------- Door → Résumé ------------------------------------- */}
      <g id="obj-door">
        {/* The door itself is almost entirely in shadow; what you actually see
            is the light escaping around its edge. */}
        <rect x="1404" y="0" width="196" height="790" fill="#080706" />
        <rect x="1448" y="0" width="30" height="778" fill="url(#g-doorstrip)" data-warm="0.9" data-warm-swing="0.14" />
        <rect x="1459" y="0" width="7" height="778" fill="#ffe0b4" data-warm="0.95" data-warm-swing="0.14" />
        <ellipse
          cx="1463"
          cy="400"
          rx="120"
          ry="420"
          fill="url(#g-candle-bloom)"
          filter="url(#f-bloom-lg)"
          className="lamp-bloom"
          data-warm="0.5"
          data-warm-swing="0.16"
        />
        <rect x="1478" y="0" width="122" height="790" fill="#0a0908" />
      </g>

      {/* Edge falloff. */}
      <rect x="0" y="0" width="1600" height="200" fill="url(#g-ceiling-fall)" />
      <rect x="0" y="470" width="1600" height="230" fill="url(#g-floor-fall)" />
      <rect x="0" y="0" width="180" height="900" fill="url(#g-side-fall)" opacity="0.5" />
    </g>
  );
}
