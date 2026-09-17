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
        d="M292 382 C214 400 150 456 132 540 L104 900 L470 900 L452 548
           C436 462 384 404 318 384 Z"
        fill="#08070a"
      />
      {/* Arm reaching to the keyboard. Stroked, not filled: a round cap gives a
          hand and a natural taper that a filled wedge never will. */}
      <path
        d="M392 470 C440 492 482 522 512 556"
        fill="none"
        stroke="#08070a"
        strokeWidth="62"
        strokeLinecap="round"
      />
      {/* Head and curls. The silhouette is built from overlapping lobes so the
          outline is irregular the way hair is, not a clean ellipse. */}
      <ellipse cx="302" cy="300" rx="72" ry="78" fill="#08070a" />
      {[
        [250, 254, 28], [280, 230, 31], [318, 224, 33], [352, 246, 28],
        [366, 282, 25], [242, 306, 23], [264, 222, 21], [340, 218, 23],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#08070a" />
      ))}
      <rect x="272" y="358" width="60" height="42" fill="#08070a" />

      {/* Rim light. The key is warm and in front-right of him, so the warm edge
          runs down the side facing the laptop. */}
      <path
        d="M366 232 C392 256 400 300 386 340"
        fill="none"
        stroke="#ffd9a4"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.42"
        filter="url(#f-soft)"
      />
      <path
        d="M392 372 C428 400 448 460 452 548 L456 640"
        fill="none"
        stroke="#ffcb92"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.34"
        filter="url(#f-soft)"
      />
      <path
        d="M462 528 C486 542 502 552 514 562"
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
        d="M214 404 C176 432 148 484 138 546"
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
