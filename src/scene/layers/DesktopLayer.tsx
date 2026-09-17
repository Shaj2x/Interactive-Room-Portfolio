import { screenLines } from '../../content/profile';

/**
 * Objects on the desk. Depth 0.55.
 * Hotspots here: the laptop (What I build), the mug (Play), the phone (Contact).
 * The lamp is NOT a hotspot — it is the easter egg that dims the room.
 */

interface Props {
  /** Index into `screenLines`; the parent advances it slowly. */
  screenLine: number;
  /** Easter egg state. False = lamp off, the room falls further into shadow. */
  lampOn: boolean;
  onToggleLamp: () => void;
}

/** Faint lines of "code" on the laptop screen. Decorative, never readable. */
const CODE_ROWS = [
  [0.62, 0.3], [0.44, 0.55], [0.78, 0.22], [0.36, 0.62],
  [0.7, 0.4], [0.5, 0.48], [0.82, 0.26], [0.4, 0.58],
  [0.66, 0.34], [0.46, 0.5],
];

export function DesktopLayer({ screenLine, lampOn, onToggleLamp }: Props) {
  return (
    <g id="layer-desktop">
      {/* ---------------- Desk lamp (easter egg) --------------------------- */}
      <g id="obj-lamp" className={lampOn ? 'lamp is-on' : 'lamp is-off'}>
        {lampOn && (
          <>
            <path
              d="M470 372 L392 622 L604 622 Z"
              fill="url(#g-lamp-cone)"
              className="lamp-cone"
              filter="url(#f-haze)"
              opacity="0.55"
            />
            <ellipse
              cx="486"
              cy="382"
              rx="150"
              ry="130"
              fill="url(#g-lamp-bloom)"
              className="lamp-bloom"
              filter="url(#f-bloom-lg)"
              data-warm="0.95"
              data-warm-swing="0.16"
            />
          </>
        )}
        <ellipse cx="388" cy="616" rx="54" ry="14" fill="#0b131b" />
        <path d="M386 612 L370 424" stroke="#16242f" strokeWidth="9" strokeLinecap="round" />
        <path d="M370 424 L468 380" stroke="#16242f" strokeWidth="9" strokeLinecap="round" />
        <path d="M444 356 L508 390 L478 414 L428 384 Z" fill="#1a2934" />
        {lampOn && (
          <ellipse
            cx="478"
            cy="398"
            rx="17"
            ry="11"
            fill="#ffd3a1"
            data-warm="0.92"
            data-warm-swing="0.2"
          />
        )}
        {/* Generous invisible target so the egg is findable without being obvious. */}
        <rect
          x="352"
          y="348"
          width="176"
          height="286"
          fill="transparent"
          className="lamp-hit"
          role="button"
          tabIndex={0}
          aria-pressed={lampOn}
          aria-label={lampOn ? 'Turn the desk lamp off' : 'Turn the desk lamp on'}
          onClick={onToggleLamp}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleLamp();
            }
          }}
        />
      </g>

      {/* ---------------- Mug → Play --------------------------------------- */}
      <g id="obj-mug">
        <path
          d="M868 566 C888 566 894 580 894 592 C894 606 884 616 868 616"
          fill="none"
          stroke="#1d2b37"
          strokeWidth="9"
        />
        <path d="M806 562 L812 620 C812 630 862 630 862 620 L868 562 Z" fill="#17242f" />
        <ellipse cx="837" cy="562" rx="31" ry="9" fill="#0b141c" />
        <ellipse cx="837" cy="562" rx="24" ry="6" fill="#221a12" />
        {/* Steam, only while the lamp is on — it is the warm part of the frame. */}
        <path
          d="M828 548 C822 534 838 528 832 512"
          fill="none"
          stroke="#cfe6f5"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.14"
          className="steam"
        />
        <path
          d="M848 550 C842 538 856 530 850 516"
          fill="none"
          stroke="#cfe6f5"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.1"
          className="steam steam-b"
        />
        {/* Screen light catching the rim */}
        <path
          d="M862 566 L868 616"
          stroke="#8fd2f5"
          strokeWidth="3"
          opacity="0.3"
          strokeLinecap="round"
        />
      </g>

      {/* ---------------- Laptop → What I build ---------------------------- */}
      <g id="obj-laptop">
        {/* The bloom that lights the whole room. Drawn under the screen. */}
        <ellipse
          cx="1046"
          cy="504"
          rx="320"
          ry="240"
          fill="url(#g-screen-bloom)"
          className="screen-bloom"
          filter="url(#f-bloom-lg)"
        />
        {/* Lid */}
        <path d="M918 404 L1178 392 L1190 620 L906 620 Z" fill="#0e1922" />
        {/* Screen */}
        <path
          d="M930 416 L1166 405 L1177 608 L919 608 Z"
          fill="url(#g-screen)"
          className="screen"
        />
        {/* Content on the screen. Clipped to the screen shape. */}
        <g clipPath="url(#clip-screen)" opacity="0.5">
          {CODE_ROWS.map(([w, o], i) => (
            <rect
              key={i}
              x={944}
              y={432 + i * 17}
              width={200 * w}
              height="6"
              rx="2"
              fill="#0b2231"
              opacity={o}
            />
          ))}
        </g>
        <clipPath id="clip-screen">
          <path d="M930 416 L1166 405 L1177 608 L919 608 Z" />
        </clipPath>
        {/* The one line that actually says something. Cycles slowly. */}
        <text
          x="946"
          y="596"
          className="screen-line"
          fill="#0a2533"
          fontSize="15"
          fontFamily="ui-monospace, monospace"
          opacity="0.7"
        >
          {screenLines[screenLine % screenLines.length]}
        </text>
        {/* Keyboard deck */}
        <path d="M906 620 L1190 620 L1214 656 L928 656 Z" fill="#131f29" />
        <path d="M938 628 L1178 628 L1192 646 L950 646 Z" fill="#0b141c" opacity="0.8" />
        <path d="M906 620 L1190 620 L1190 624 L906 624 Z" fill="#cfe6f5" opacity="0.3" />
      </g>

      {/* ---------------- Phone → Contact ---------------------------------- */}
      <g id="obj-phone">
        <ellipse
          cx="1256"
          cy="604"
          rx="86"
          ry="52"
          fill="url(#g-screen-bloom)"
          className="phone-bloom"
          filter="url(#f-bloom-sm)"
        />
        <path d="M1212 586 L1298 580 L1304 626 L1218 632 Z" fill="#0c151d" />
        <path d="M1218 590 L1292 585 L1297 621 L1223 626 Z" fill="#7fc7ea" opacity="0.5" />
        {/* Notification dot — the only place the accent appears at rest. */}
        <circle cx="1288" cy="590" r="6" fill="#5fe7e0" className="notif-dot" />
      </g>
    </g>
  );
}
