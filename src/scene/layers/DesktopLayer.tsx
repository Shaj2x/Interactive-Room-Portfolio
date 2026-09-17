import { screenLines } from '../../content/profile';

/**
 * Objects on the desk. Depth 0.55.
 * Hotspots: the laptop (What I build), the mug (Play), the phone (Contact).
 *
 * The laptop is the room's key light and it is WARM — cream going to amber.
 * The phone is the one cool light in the frame, and that contrast is what
 * keeps the warmth from reading as a sepia wash over everything.
 */

interface Props {
  screenLine: number;
  lampOn: boolean;
  onToggleLamp: () => void;
}

const CODE_ROWS = [
  [0.6, 0.34], [0.42, 0.5], [0.74, 0.26], [0.34, 0.56],
  [0.66, 0.4], [0.48, 0.44], [0.78, 0.28], [0.38, 0.52],
];

export function DesktopLayer({ screenLine, lampOn, onToggleLamp }: Props) {
  return (
    <g id="layer-desktop">
      {/* ---------------- Laptop → What I build ----------------------------- */}
      <g id="obj-laptop">
        {/* The bloom that lights the room, drawn under the screen. */}
        <ellipse
          cx="560"
          cy="556"
          rx="300"
          ry="220"
          fill="url(#g-key-bloom)"
          className="key-bloom"
          filter="url(#f-bloom-lg)"
        />
        {/* Lid, seen from behind-left, so we catch the lit face at an angle. */}
        <path d="M448 480 L588 490 L582 644 L454 638 Z" fill="#100d0b" />
        <path d="M456 488 L580 497 L575 636 L462 631 Z" fill="url(#g-key)" className="screen" />
        <g clipPath="url(#clip-screen)" opacity="0.4">
          <clipPath id="clip-screen">
            <path d="M456 488 L580 497 L575 636 L462 631 Z" />
          </clipPath>
          {CODE_ROWS.map(([w, o], i) => (
            <rect key={i} x={470} y={508 + i * 14} width={98 * w} height="5" rx="2" fill="#4a2c0c" opacity={o} />
          ))}
        </g>
        <text
          x="470"
          y="622"
          className="screen-line"
          fill="#5a3410"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          opacity="0.75"
        >
          {screenLines[screenLine % screenLines.length]}
        </text>
        {/* Keyboard deck, catching the screen's own light. */}
        <path d="M454 638 L582 644 L606 682 L462 676 Z" fill="#1b1611" />
        <path d="M470 646 L578 651 L594 674 L478 670 Z" fill="#2e2418" opacity="0.9" />
        <path d="M454 638 L582 644 L582 648 L454 642 Z" fill="#ffe7c6" opacity="0.4" />
      </g>

      {/* ---------------- Mug → Play ----------------------------------------- */}
      <g id="obj-mug">
        <path d="M700 596 C718 596 724 608 724 618 C724 630 714 638 700 638" fill="none" stroke="#a08f79" strokeWidth="8" />
        <path d="M642 588 L648 642 C648 652 696 652 696 642 L702 588 Z" fill="#a8957c" />
        {/* The side away from the laptop falls into shadow. */}
        <path d="M672 588 L676 648 C688 647 696 645 696 642 L702 588 Z" fill="#8f8172" opacity="0.55" />
        <ellipse cx="672" cy="588" rx="30" ry="9" fill="#b6a389" />
        <ellipse cx="672" cy="588" rx="23" ry="6" fill="#2a1b10" />
        <path d="M662 574 C656 560 672 554 666 538" fill="none" stroke="#ffe7c6" strokeWidth="2.5" strokeLinecap="round" opacity="0.14" className="steam" />
        <path d="M682 576 C676 564 690 556 684 542" fill="none" stroke="#ffe7c6" strokeWidth="2.5" strokeLinecap="round" opacity="0.1" className="steam steam-b" />
      </g>

      {/* ---------------- Phone → Contact ------------------------------------ */}
      <g id="obj-phone">
        <ellipse cx="724" cy="672" rx="92" ry="56" fill="url(#g-cool-bloom)" className="phone-bloom" filter="url(#f-bloom-sm)" />
        <path d="M680 652 L766 646 L772 690 L686 696 Z" fill="#0d0f13" />
        <path d="M686 656 L760 651 L765 686 L691 691 Z" fill="#a8d4ee" opacity="0.62" />
        {/* The only accent-coloured thing in the room at rest. */}
        <circle cx="756" cy="656" r="5.5" fill="#5fe7e0" className="notif-dot" />
      </g>

      {/* ---------------- Desk lamp (the easter egg) -------------------------- */}
      <g id="obj-lamp" className={lampOn ? 'lamp is-on' : 'lamp is-off'}>
        <ellipse cx="352" cy="652" rx="40" ry="11" fill="#14100c" />
        <path d="M350 648 L338 548" stroke="#1c1712" strokeWidth="8" strokeLinecap="round" />
        <path d="M338 548 L390 524" stroke="#1c1712" strokeWidth="8" strokeLinecap="round" />
        <path d="M374 508 L418 530 L398 548 L362 528 Z" fill="#221a13" />
        {lampOn && (
          <>
            <ellipse cx="396" cy="534" rx="12" ry="8" fill="#ffd3a1" data-warm="0.9" data-warm-swing="0.2" />
            <ellipse
              cx="396"
              cy="534"
              rx="120"
              ry="104"
              fill="url(#g-candle-bloom)"
              className="lamp-bloom"
              filter="url(#f-bloom-lg)"
              data-warm="0.72"
              data-warm-swing="0.18"
            />
          </>
        )}
        {/* A generous invisible target, so the egg is findable but not obvious. */}
        <rect
          x="324"
          y="500"
          width="108"
          height="164"
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
    </g>
  );
}
