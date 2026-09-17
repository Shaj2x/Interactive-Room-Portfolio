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
          cx="500"
          cy="452"
          rx="300"
          ry="220"
          fill="url(#g-key-bloom)"
          className="key-bloom"
          filter="url(#f-bloom-lg)"
        />
        {/* Lid, seen from behind-left, so we catch the lit face at an angle. */}
        <path d="M430 372 L566 382 L560 546 L436 540 Z" fill="#100d0b" />
        <path d="M438 380 L558 389 L553 538 L444 533 Z" fill="url(#g-key)" className="screen" />
        <g clipPath="url(#clip-screen)" opacity="0.4">
          <clipPath id="clip-screen">
            <path d="M438 380 L558 389 L553 538 L444 533 Z" />
          </clipPath>
          {CODE_ROWS.map(([w, o], i) => (
            <rect key={i} x={452} y={398 + i * 15} width={96 * w} height="5" rx="2" fill="#4a2c0c" opacity={o} />
          ))}
        </g>
        <text
          x="452"
          y="524"
          className="screen-line"
          fill="#5a3410"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          opacity="0.75"
        >
          {screenLines[screenLine % screenLines.length]}
        </text>
        {/* Keyboard deck, catching the screen's own light. */}
        <path d="M436 540 L560 546 L584 580 L444 574 Z" fill="#1b1611" />
        <path d="M452 548 L556 553 L572 572 L460 568 Z" fill="#2e2418" opacity="0.9" />
        <path d="M436 540 L560 546 L560 550 L436 544 Z" fill="#ffe7c6" opacity="0.4" />
      </g>

      {/* ---------------- Mug → Play ----------------------------------------- */}
      <g id="obj-mug">
        <path d="M652 470 C670 470 676 482 676 492 C676 504 666 512 652 512" fill="none" stroke="#a08f79" strokeWidth="8" />
        <path d="M594 462 L600 516 C600 526 648 526 648 516 L654 462 Z" fill="#b3a087" />
        {/* The side away from the laptop falls into shadow. */}
        <path d="M624 462 L628 522 C640 521 648 519 648 516 L654 462 Z" fill="#8f8172" opacity="0.55" />
        <ellipse cx="624" cy="462" rx="30" ry="9" fill="#c4b298" />
        <ellipse cx="624" cy="462" rx="23" ry="6" fill="#2a1b10" />
        <path d="M614 448 C608 434 624 428 618 412" fill="none" stroke="#ffe7c6" strokeWidth="2.5" strokeLinecap="round" opacity="0.14" className="steam" />
        <path d="M634 450 C628 438 642 430 636 416" fill="none" stroke="#ffe7c6" strokeWidth="2.5" strokeLinecap="round" opacity="0.1" className="steam steam-b" />
      </g>

      {/* ---------------- Phone → Contact ------------------------------------ */}
      <g id="obj-phone">
        <ellipse cx="680" cy="552" rx="92" ry="56" fill="url(#g-cool-bloom)" className="phone-bloom" filter="url(#f-bloom-sm)" />
        <path d="M638 534 L724 528 L730 570 L644 576 Z" fill="#0d0f13" />
        <path d="M644 538 L718 533 L723 566 L649 571 Z" fill="#a8d4ee" opacity="0.62" />
        {/* The only accent-coloured thing in the room at rest. */}
        <circle cx="714" cy="538" r="5.5" fill="#5fe7e0" className="notif-dot" />
      </g>

      {/* ---------------- Desk lamp (the easter egg) -------------------------- */}
      <g id="obj-lamp" className={lampOn ? 'lamp is-on' : 'lamp is-off'}>
        <ellipse cx="392" cy="536" rx="42" ry="11" fill="#14100c" />
        <path d="M390 532 L376 420" stroke="#1c1712" strokeWidth="8" strokeLinecap="round" />
        <path d="M376 420 L432 392" stroke="#1c1712" strokeWidth="8" strokeLinecap="round" />
        <path d="M414 374 L462 398 L440 418 L400 396 Z" fill="#221a13" />
        {lampOn && (
          <>
            <ellipse cx="438" cy="404" rx="13" ry="9" fill="#ffd3a1" data-warm="0.9" data-warm-swing="0.2" />
            <ellipse
              cx="438"
              cy="404"
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
          x="360"
          y="368"
          width="120"
          height="180"
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
