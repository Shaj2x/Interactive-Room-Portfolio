/**
 * The figure at the desk. Depth 0.85 — nearest of the drawn subjects, so it
 * takes the most parallax.
 *
 * Left of centre and large in frame, seen from behind, curly hair. It stays a
 * near-flat silhouette on purpose: lit from in front by the laptop, that is
 * genuinely what you would see, and painting folds into it only produced
 * lighter patches that read as blocks. The rim light does the work.
 */
export function PersonLayer() {
  return (
    <g id="layer-person" className="paintable" filter="url(#f-paint-fine)">
      {/* Shoulders and back, cut off by the bottom of the frame. */}
      <path
        d="M340 452 C236 476 154 548 132 660 L100 900 L516 900 L500 672
           C482 556 436 478 398 456 Z"
        fill="#08070a"
      />
      {/* Arm reaching to the keyboard. Stroked, not filled: a round cap gives a
          hand and a natural taper that a filled wedge never will. */}
      <path
        d="M416 626 C470 652 512 668 548 684"
        fill="none"
        stroke="#08070a"
        strokeWidth="64"
        strokeLinecap="round"
      />
      {/* Head and curls. The silhouette is built from overlapping lobes so the
          outline is irregular the way hair is, not a clean ellipse. */}
      <ellipse cx="376" cy="334" rx="84" ry="94" fill="#08070a" />
      {[
        [314, 280, 33], [350, 250, 37], [394, 242, 39], [434, 268, 33],
        [450, 310, 30], [304, 340, 27], [330, 240, 25], [418, 234, 27],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#08070a" />
      ))}
      <rect x="342" y="404" width="70" height="52" fill="#08070a" />

      {/* Rim light. The key is warm and in front-right of him, so the warm edge
          runs down the side facing the laptop. */}
      <path
        d="M450 262 C480 292 490 344 474 392"
        fill="none"
        stroke="#ffd9a4"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.42"
        filter="url(#f-soft)"
      />
      <path
        d="M452 456 C494 492 512 566 500 672 L498 768"
        fill="none"
        stroke="#ffcb92"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.34"
        filter="url(#f-soft)"
      />
      <path
        d="M498 668 C526 680 542 686 556 690"
        fill="none"
        stroke="#ffe7c6"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.36"
        filter="url(#f-soft)"
      />
      {/* A trace of the window's cool light on the far shoulder — the only
          thing separating his back edge from the wall behind it. */}
      <path
        d="M258 484 C208 522 168 586 146 664"
        fill="none"
        stroke="#9fc9e8"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.13"
        filter="url(#f-soft)"
      />
    </g>
  );
}
