/**
 * Back wall, depth 0.15 — the furthest plane, so it moves least under parallax.
 * Carries four hotspot objects (corkboard, poster, sticky notes, door) plus the
 * window, which is ambient only and deliberately not clickable.
 */

const POLAROIDS = [
  { x: 560, y: 108, w: 62, h: 74, r: -6 },
  { x: 640, y: 120, w: 58, h: 70, r: 4 },
  { x: 712, y: 106, w: 64, h: 76, r: -3 },
  { x: 572, y: 198, w: 60, h: 72, r: 5 },
  { x: 654, y: 206, w: 56, h: 66, r: -4 },
  { x: 726, y: 196, w: 58, h: 70, r: 7 },
];

const STICKIES = [
  { x: 1142, y: 152, s: 56, r: -5, fill: '#2a3b2e' },
  { x: 1214, y: 160, s: 52, r: 6, fill: '#3a3526' },
  { x: 1150, y: 224, s: 54, r: 4, fill: '#33302a' },
  { x: 1222, y: 234, s: 50, r: -7, fill: '#26343c' },
];

/** Distant windows in the buildings outside. Fixed seed, so no layout jitter. */
const CITY = [
  [148, 286], [172, 254], [206, 300], [232, 268], [268, 312],
  [292, 246], [318, 292], [346, 262], [368, 306], [196, 330],
  [252, 342], [330, 336], [128, 318], [386, 274],
];

const RAIN = Array.from({ length: 22 }, (_, i) => ({
  x: 118 + ((i * 37) % 272),
  delay: (i * 0.41) % 4.2,
  dur: 2.6 + ((i * 7) % 11) / 10,
  len: 16 + ((i * 13) % 18),
}));

export function WallLayer() {
  return (
    <g id="layer-wall">
      {/* Wall and floor */}
      <rect x="0" y="0" width="1600" height="690" fill="url(#g-wall)" />
      <rect x="0" y="686" width="1600" height="214" fill="url(#g-floor)" />
      <rect x="0" y="664" width="1600" height="24" fill="#0a1119" />
      <rect x="0" y="664" width="1600" height="2" fill="#16242f" opacity="0.7" />

      {/* Pool of screen light thrown onto the wall behind the desk. */}
      <ellipse
        cx="1040"
        cy="470"
        rx="470"
        ry="300"
        fill="url(#g-screen-bloom)"
        opacity="0.5"
        filter="url(#f-bloom-lg)"
      />

      {/* ---------------- Window (ambient only, not a hotspot) ------------- */}
      <g id="obj-window">
        <rect x="110" y="120" width="290" height="300" rx="4" fill="url(#g-window)" />
        <g className="rain-group">
          {CITY.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={1.6}
              fill="#8fd2f5"
              opacity="0.5"
              className="city-light"
              style={{ animationDelay: `${(i * 0.7) % 5}s` }}
            />
          ))}
          {RAIN.map((d, i) => (
            <line
              key={i}
              x1={d.x}
              y1="120"
              x2={d.x - 6}
              y2={120 + d.len}
              stroke="#9fd4f0"
              strokeWidth="1.1"
              opacity="0.22"
              className="raindrop"
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
            />
          ))}
        </g>
        {/* Frame and mullions */}
        <rect
          x="110"
          y="120"
          width="290"
          height="300"
          rx="4"
          fill="none"
          stroke="#16242f"
          strokeWidth="9"
        />
        <line x1="255" y1="120" x2="255" y2="420" stroke="#16242f" strokeWidth="7" />
        <line x1="110" y1="270" x2="400" y2="270" stroke="#16242f" strokeWidth="7" />
        <rect x="104" y="414" width="302" height="14" rx="3" fill="#121e28" />
      </g>

      {/* ---------------- Corkboard → About -------------------------------- */}
      <g id="obj-corkboard">
        <rect x="536" y="84" width="268" height="220" rx="5" fill="#1b1813" />
        <rect
          x="536"
          y="84"
          width="268"
          height="220"
          rx="5"
          fill="none"
          stroke="#2a2419"
          strokeWidth="7"
        />
        {POLAROIDS.map((p, i) => (
          <g key={i} transform={`rotate(${p.r} ${p.x + p.w / 2} ${p.y + p.h / 2})`}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#1d2731" />
            <rect
              x={p.x + 5}
              y={p.y + 5}
              width={p.w - 10}
              height={p.h - 20}
              fill="#25333f"
              opacity="0.95"
            />
            <circle cx={p.x + p.w / 2} cy={p.y + 4} r="3" fill="#4d6070" />
          </g>
        ))}
      </g>

      {/* ---------------- Poster frame → Projects -------------------------- */}
      <g id="obj-poster">
        <rect x="876" y="86" width="208" height="248" rx="3" fill="#0d151d" />
        <rect
          x="876"
          y="86"
          width="208"
          height="248"
          rx="3"
          fill="none"
          stroke="#1c2a36"
          strokeWidth="8"
        />
        <rect x="894" y="104" width="172" height="212" fill="#101b25" />
        {/* Six marks on the print — one per shipped project. */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={910 + (i % 2) * 74}
            y={122 + Math.floor(i / 2) * 62}
            width="62"
            height="46"
            rx="2"
            fill="#1b2d3c"
            opacity={0.55 + i * 0.05}
          />
        ))}
        <line x1="910" y1="292" x2="1050" y2="292" stroke="#2b4759" strokeWidth="2" />
      </g>

      {/* ---------------- Sticky notes → Leadership ------------------------ */}
      <g id="obj-stickies">
        {STICKIES.map((s, i) => (
          <g key={i} transform={`rotate(${s.r} ${s.x + s.s / 2} ${s.y + s.s / 2})`}>
            <rect x={s.x} y={s.y} width={s.s} height={s.s} fill={s.fill} />
            <line
              x1={s.x + 9}
              y1={s.y + 18}
              x2={s.x + s.s - 9}
              y2={s.y + 18}
              stroke="#5d7086"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1={s.x + 9}
              y1={s.y + 30}
              x2={s.x + s.s - 16}
              y2={s.y + 30}
              stroke="#5d7086"
              strokeWidth="2"
              opacity="0.35"
            />
          </g>
        ))}
      </g>

      {/* ---------------- Door → Résumé ------------------------------------ */}
      <g id="obj-door">
        <rect x="1338" y="24" width="264" height="676" fill="#0a121a" />
        <rect
          x="1338"
          y="24"
          width="264"
          height="676"
          fill="none"
          stroke="#16232e"
          strokeWidth="10"
        />
        <rect x="1372" y="72" width="94" height="240" rx="3" fill="#0d1721" />
        <rect x="1490" y="72" width="94" height="240" rx="3" fill="#0d1721" />
        <rect x="1372" y="356" width="94" height="288" rx="3" fill="#0d1721" />
        <rect x="1490" y="356" width="94" height="288" rx="3" fill="#0d1721" />
        <circle cx="1360" cy="386" r="9" fill="#2a3b48" />
        {/* Warm light leaking under the door — the room's second light source. */}
        <rect
          x="1330"
          y="644"
          width="278"
          height="56"
          fill="url(#g-doorleak)"
          className="door-leak"
        />
        <rect x="1330" y="690" width="278" height="8" fill="#ffc287" opacity="0.5" />
        <ellipse
          cx="1460"
          cy="712"
          rx="210"
          ry="46"
          fill="url(#g-lamp-bloom)"
          opacity="0.45"
          filter="url(#f-bloom-lg)"
        />
      </g>
    </g>
  );
}
