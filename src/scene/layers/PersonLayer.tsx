/**
 * The person at the desk. Depth 0.85 — nearest of the drawn subjects, so it
 * takes the most parallax. Drawn as a silhouette with a screen-blue rim light
 * on the side facing the laptop: the figure should read as a shape, not a
 * portrait. Not interactive.
 */
export function PersonLayer() {
  return (
    <g id="layer-person">
      {/* Body: shoulders and back, cut off by the bottom of the frame. */}
      <path
        d="M604 436 C566 452 542 500 538 548 L532 900 L812 900 L806 566
           C802 512 780 462 740 438 Z"
        fill="#05090e"
      />
      {/* Arm reaching toward the laptop. Stroked, not filled: a round cap
          gives a hand and a natural taper that a filled wedge cannot. */}
      <path
        d="M734 498 C800 514 856 558 890 606"
        fill="none"
        stroke="#05090e"
        strokeWidth="56"
        strokeLinecap="round"
      />
      {/* Head */}
      <ellipse cx="672" cy="376" rx="54" ry="62" fill="#05090e" />
      {/* Neck */}
      <rect x="648" y="424" width="48" height="30" fill="#05090e" />

      {/* Rim light — right side only, thrown by the screen. */}
      <path
        d="M716 344 C736 362 740 400 728 428"
        fill="none"
        stroke="#bfe4ff"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.5"
        filter="url(#f-soft)"
      />
      <path
        d="M742 442 C776 466 796 512 802 566 L806 640"
        fill="none"
        stroke="#8fd2f5"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.38"
        filter="url(#f-soft)"
      />
      <path
        d="M846 556 C872 576 886 592 898 610"
        fill="none"
        stroke="#bfe4ff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
        filter="url(#f-soft)"
      />
      {/* A trace of the warm lamp on the far shoulder, for contrast. */}
      <path
        d="M604 438 C572 458 550 494 542 534 C536 570 534 606 534 640"
        fill="none"
        stroke="#ffb567"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#f-soft)"
        data-warm="0.34"
        data-warm-swing="0.3"
      />
      <path
        d="M632 330 C608 342 596 362 594 386"
        fill="none"
        stroke="#ffcb92"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#f-soft)"
        data-warm="0.28"
        data-warm-swing="0.3"
      />
    </g>
  );
}
