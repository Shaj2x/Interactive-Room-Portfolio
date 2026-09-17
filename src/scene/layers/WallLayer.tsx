/**
 * The back wall, depth 0.15 — furthest plane, so it takes the least parallax.
 *
 * Geometry follows the reference frame proportionally: corkboard upper-left,
 * a patch of bare wall, the framed print, then the window across the right
 * third and the door edge beyond it.
 */

const PINNED = [
  { x: 44, y: 84, w: 60, h: 74, r: -5, tint: '#4a5560' },
  { x: 122, y: 74, w: 56, h: 70, r: 4, tint: '#6b5140' },
  { x: 198, y: 90, w: 58, h: 72, r: -3, tint: '#3f4f46' },
  { x: 40, y: 196, w: 66, h: 80, r: 3, tint: '#5a4a3c' },
  { x: 124, y: 208, w: 58, h: 72, r: -6, tint: '#3c4a58' },
  { x: 198, y: 200, w: 56, h: 68, r: 5, tint: '#5e4838' },
  { x: 60, y: 310, w: 62, h: 76, r: -4, tint: '#4a4036' },
  { x: 150, y: 318, w: 58, h: 70, r: 6, tint: '#44505c' },
];

const STICKIES = [
  { x: 304, y: 70, s: 52, r: -5, fill: '#4b4429' },
  { x: 368, y: 80, s: 48, r: 6, fill: '#413a24' },
  { x: 312, y: 136, s: 50, r: 4, fill: '#46402a' },
  { x: 374, y: 144, s: 46, r: -7, fill: '#3a3524' },
];

/* The city fills the window. Dense and bright — in the reference it is the
   busiest thing in the frame, and the only place the eye rests outside. */
const TOWERS = [
  { x: 980, w: 62, top: 214 }, { x: 1046, w: 46, top: 150 },
  { x: 1096, w: 72, top: 246 }, { x: 1172, w: 42, top: 104 },
  { x: 1218, w: 58, top: 190 }, { x: 1280, w: 50, top: 138 },
  { x: 1334, w: 66, top: 226 }, { x: 1016, w: 26, top: 118 },
  { x: 1156, w: 20, top: 88 }, { x: 1262, w: 22, top: 96 },
  { x: 1404, w: 44, top: 176 }, { x: 1120, w: 30, top: 160 },
];

const CITY_LIGHTS = Array.from({ length: 170 }, (_, i) => {
  const t = TOWERS[i % TOWERS.length];
  const col = i % 8;
  return {
    x: t.x + 4 + ((i * 11) % Math.max(1, t.w - 10)),
    y: t.top + 8 + ((i * 31) % 224),
    w: 2.5 + ((i * 5) % 4),
    h: 2 + ((i * 3) % 3),
    fill:
      col < 3 ? '#ffb861' : col < 5 ? '#e8f2fb' : col === 5 ? '#7fb8e8' : col === 6 ? '#ff8d4a' : '#9ad4ff',
    o: 0.5 + ((i * 7) % 50) / 100,
    delay: (i * 0.23) % 8,
  };
});

const RAIN = Array.from({ length: 54 }, (_, i) => ({
  x: 978 + ((i * 61) % 346),
  delay: (i * 0.23) % 4.6,
  dur: 1.2 + ((i * 17) % 19) / 10,
  len: 22 + ((i * 13) % 44),
  w: 0.8 + ((i * 7) % 5) / 5,
}));

const RUNNELS = Array.from({ length: 13 }, (_, i) => ({
  x: 990 + ((i * 71) % 326),
  y: 30 + ((i * 47) % 280),
  r: 1.7 + ((i * 11) % 7) / 3,
  delay: (i * 0.91) % 9,
  dur: 5 + ((i * 19) % 41) / 5,
}));

export function WallLayer() {
  return (
    <g id="layer-wall">
      <rect x="0" y="0" width="1600" height="720" fill="url(#g-wall)" />
      <rect x="0" y="706" width="1600" height="194" fill="url(#g-floor)" />

      {/* Uneven paint. The fine plaster grain is <WallTexture>, a composited
          layer — as an SVG filter it was re-rasterised on every parallax frame. */}
      <g filter="url(#f-dof)" opacity="0.5">
        <ellipse cx="200" cy="280" rx="320" ry="250" fill="#2e2015" />
        <ellipse cx="640" cy="200" rx="340" ry="210" fill="#18130f" />
        <ellipse cx="1240" cy="470" rx="380" ry="240" fill="#0f1319" />
        <ellipse cx="500" cy="600" rx="340" ry="190" fill="#33240f" />
      </g>

      {/* Key light thrown back onto the wall, and the warm pool that lights the
          bookshelf — in the reference the shelf is clearly lit, not in shadow. */}
      <ellipse cx="520" cy="500" rx="400" ry="300" fill="url(#g-key-bloom)" opacity="0.4" filter="url(#f-bloom-lg)" className="key-bloom" />
      <ellipse cx="720" cy="380" rx="300" ry="280" fill="url(#g-key-bloom)" opacity="0.3" filter="url(#f-bloom-lg)" className="key-bloom" />

      {/* ---------------- Corkboard → About -------------------------------- */}
      <g id="obj-corkboard" className="paintable" filter="url(#f-paint)">
        <rect x="24" y="54" width="258" height="384" rx="4" fill="url(#g-cork)" />
        <rect x="24" y="54" width="258" height="384" rx="4" fill="none" stroke="#4a3018" strokeWidth="12" />
        {PINNED.map((p, i) => (
          <g key={i} transform={`rotate(${p.r} ${p.x + p.w / 2} ${p.y + p.h / 2})`}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#1a1512" />
            <rect x={p.x + 5} y={p.y + 5} width={p.w - 10} height={p.h - 22} fill={p.tint} opacity="0.9" />
            <circle cx={p.x + p.w / 2} cy={p.y + 4} r="3" fill="#b07f3e" />
          </g>
        ))}
      </g>

      {/* ---------------- Sticky notes → Leadership ------------------------ */}
      <g id="obj-stickies" className="paintable" filter="url(#f-paint)">
        {STICKIES.map((s, i) => (
          <g key={i} transform={`rotate(${s.r} ${s.x + s.s / 2} ${s.y + s.s / 2})`}>
            <rect x={s.x} y={s.y} width={s.s} height={s.s} fill={s.fill} />
            <line x1={s.x + 9} y1={s.y + 18} x2={s.x + s.s - 9} y2={s.y + 18} stroke="#9c8d66" strokeWidth="2" opacity="0.4" />
            <line x1={s.x + 9} y1={s.y + 30} x2={s.x + s.s - 16} y2={s.y + 30} stroke="#9c8d66" strokeWidth="2" opacity="0.28" />
          </g>
        ))}
      </g>

      {/* ---------------- Framed print → Projects --------------------------- */}
      <g id="obj-poster" className="paintable" filter="url(#f-paint)">
        <rect x="672" y="12" width="160" height="150" fill="#100d0b" />
        <rect x="672" y="12" width="160" height="150" fill="none" stroke="#2a1e14" strokeWidth="10" />
        <rect x="688" y="26" width="128" height="122" fill="#16202b" />
        <ellipse cx="752" cy="72" rx="30" ry="36" fill="#d1a44a" opacity="0.7" />
        <path d="M712 148 C718 112 734 96 752 96 C770 96 786 112 792 148 Z" fill="#1e1d1b" />
      </g>

      {/* ---------------- Window (ambient only) ----------------------------- */}
      <g id="obj-window">
        <rect x="976" y="16" width="352" height="434" fill="url(#g-sky)" />
        <g clipPath="url(#clip-window)">
          <clipPath id="clip-window">
            <rect x="976" y="16" width="352" height="434" />
          </clipPath>
          {TOWERS.map((t, i) => (
            <rect key={i} x={t.x} y={t.top} width={t.w} height={450 - t.top} fill="#080d15" />
          ))}
          {CITY_LIGHTS.map((c, i) => (
            <rect
              key={`c${i}`}
              x={c.x}
              y={c.y}
              width={c.w}
              height={c.h}
              fill={c.fill}
              opacity={c.o}
              className="city-light"
              style={{ animationDelay: `${c.delay}s` }}
            />
          ))}
          {/* Glow lifting off the city, so it sits behind glass. */}
          <rect x="976" y="150" width="352" height="300" fill="#2a3a4c" opacity="0.2" filter="url(#f-bloom-lg)" />
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

        <rect x="976" y="16" width="352" height="434" fill="none" stroke="#1f1a15" strokeWidth="11" />
        <line x1="1152" y1="16" x2="1152" y2="450" stroke="#1f1a15" strokeWidth="8" />
        <line x1="976" y1="252" x2="1328" y2="252" stroke="#1f1a15" strokeWidth="8" />
        <rect x="962" y="444" width="380" height="22" rx="3" fill="#251d16" />
        <ellipse cx="1152" cy="510" rx="250" ry="120" fill="url(#g-cool-bloom)" opacity="0.28" filter="url(#f-bloom-lg)" />

        {/* Curtains either side, heavy and dark. */}
        <path d="M884 6 L978 6 C954 150 958 300 982 486 L884 486 Z" fill="url(#g-curtain)" />
        <path d="M1326 6 L1412 6 L1412 486 L1322 486 C1348 300 1352 150 1326 6 Z" fill="url(#g-curtain)" />
        <rect x="876" y="4" width="544" height="14" fill="#16120e" />
      </g>

      {/* ---------------- Door → Résumé ------------------------------------- */}
      <g id="obj-door">
        <rect x="1436" y="0" width="164" height="820" fill="#090807" />
        {/* The door frame's inner edge, catching a little of the light. */}
        <rect x="1436" y="0" width="10" height="820" fill="#241b12" />
        <rect x="1502" y="0" width="30" height="808" fill="url(#g-doorstrip)" data-warm="0.9" data-warm-swing="0.14" />
        <rect x="1513" y="0" width="7" height="808" fill="#ffe4bc" data-warm="0.95" data-warm-swing="0.14" />
        {/* Handle, as in the reference. */}
        <rect x="1470" y="556" width="30" height="10" rx="5" fill="#3a2c1c" />
        <circle cx="1470" cy="561" r="9" fill="#46341f" />
        <ellipse
          cx="1517"
          cy="410"
          rx="110"
          ry="430"
          fill="url(#g-candle-bloom)"
          filter="url(#f-bloom-lg)"
          className="lamp-bloom"
          data-warm="0.5"
          data-warm-swing="0.16"
        />
        <rect x="1540" y="0" width="60" height="820" fill="#0b0a09" />
      </g>

      {/* Edge falloff. */}
      <rect x="0" y="0" width="1600" height="190" fill="url(#g-ceiling-fall)" />
      <rect x="0" y="500" width="1600" height="220" fill="url(#g-floor-fall)" />
      <rect x="0" y="0" width="150" height="900" fill="url(#g-side-fall)" opacity="0.45" />
    </g>
  );
}
