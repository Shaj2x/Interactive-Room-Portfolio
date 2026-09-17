/**
 * Bookshelf, desk, chair, bed and the low shelf at the left. Depth 0.35.
 * The bookshelf is the "Record" hotspot; everything else is scenery.
 */

/** Books: width, height, spine colour. Warm, muted, never the brightest thing. */
const BOOKS = [
  { w: 15, h: 62, c: '#5a3f26' }, { w: 11, h: 56, c: '#3d3a42' },
  { w: 19, h: 66, c: '#2f4038' }, { w: 13, h: 50, c: '#6b4426' },
  { w: 10, h: 60, c: '#40352c' }, { w: 17, h: 54, c: '#4a3a22' },
  { w: 12, h: 64, c: '#334049' }, { w: 14, h: 48, c: '#553040' },
  { w: 18, h: 58, c: '#2c3a3e' }, { w: 11, h: 62, c: '#463d33' },
];

function shelfBooks(seed: number, count: number, x0: number, baseline: number) {
  let x = x0;
  const out: JSX.Element[] = [];
  for (let i = 0; i < count; i++) {
    const b = BOOKS[(seed + i) % BOOKS.length];
    const lean = i % 5 === 4 ? -9 : 0;
    out.push(
      <rect
        key={`${seed}-${i}`}
        x={x}
        y={baseline - b.h}
        width={b.w}
        height={b.h}
        fill={b.c}
        transform={lean ? `rotate(${lean} ${x + b.w / 2} ${baseline})` : undefined}
      />,
    );
    x += b.w + 3;
  }
  return out;
}

/* Floorboards running back into the room. Boards converge slightly toward the
   centre, which is enough perspective to read as a floor rather than a void. */
const BOARDS = [
  { x: -40, s: 0 }, { x: 150, s: 34 }, { x: 350, s: 66 }, { x: 560, s: 96 },
  { x: 780, s: 122 }, { x: 1000, s: 146 }, { x: 1230, s: 166 }, { x: 1460, s: 184 },
];

export function FurnitureLayer() {
  return (
    <g id="layer-furniture">
      {/* ---------------- Floor --------------------------------------------- */}
      <g id="obj-floor" opacity="0.5">
        {BOARDS.map((b) => (
          <path
            key={b.x}
            d={`M${b.x} 900 L${b.x + b.s + 180} 690`}
            stroke="#2a1f16"
            strokeWidth="2.5"
          />
        ))}
        {/* Two cross-joints, so the boards read as boards and not as rays. */}
        <path d="M-40 802 L1600 762" stroke="#241a12" strokeWidth="2" />
        <path d="M-40 726 L1600 706" stroke="#241a12" strokeWidth="2" />
      </g>
      {/* The key light reaching the floor in front of the desk. */}
      <ellipse
        cx="560"
        cy="742"
        rx="330"
        ry="86"
        fill="url(#g-key-bloom)"
        opacity="0.3"
        filter="url(#f-bloom-lg)"
        className="key-bloom"
      />
      {/* ---------------- Bed, far right ------------------------------------ */}
      <g id="obj-bed">
        <path d="M1090 520 L1440 486 L1448 690 L1086 700 Z" fill="#0e1014" />
        {/* Rumpled bedding — a few soft folds catching the window's cool light. */}
        <path d="M1100 540 C1180 516 1270 506 1360 500 C1400 498 1430 500 1442 506 L1444 556 C1380 546 1250 552 1104 580 Z" fill="#141820" />
        <path d="M1108 600 C1200 578 1310 566 1420 566 L1424 610 C1320 608 1210 620 1112 642 Z" fill="#11141a" />
        <path d="M1096 664 L1446 644 L1448 690 L1090 700 Z" fill="#08090c" />
      </g>

      {/* ---------------- Low shelf, far left ------------------------------- */}
      <g id="obj-lowshelf">
        <rect x="-10" y="512" width="132" height="14" fill="#2c1f14" />
        <rect x="-10" y="526" width="132" height="120" fill="#120d09" />
        {/* Pen cup */}
        <rect x="52" y="466" width="34" height="46" rx="4" fill="#241a12" />
        {[58, 66, 74, 80].map((x, i) => (
          <line key={x} x1={x} y1={466} x2={x - 3 + i} y2={436 - i * 5} stroke="#4a3a2a" strokeWidth="3" strokeLinecap="round" />
        ))}
        {/* A couple of books lying flat */}
        <rect x="-10" y="492" width="54" height="9" fill="#3d2e1e" />
        <rect x="-6" y="483" width="46" height="9" fill="#2f3a33" />
        {/* Plant */}
        <path d="M18 466 C4 432 20 404 34 392 C30 418 30 444 36 466 Z" fill="#1d2a20" />
        <path d="M34 466 C48 436 44 408 34 392 C50 406 62 436 54 466 Z" fill="#17211a" />
        <rect x="8" y="466" width="52" height="46" rx="5" fill="#2a1d14" />
      </g>

      {/* ---------------- Bookshelf → Record --------------------------------- */}
      <g id="obj-bookshelf" className="paintable" filter="url(#f-paint-fine)">
        <rect x="562" y="148" width="248" height="430" fill="url(#g-wood)" />
        <rect x="570" y="156" width="232" height="414" fill="#120e0a" />
        {/* Shelf boards */}
        {[262, 366, 470].map((y) => (
          <rect key={y} x="566" y={y} width="240" height="10" fill="#4a3521" />
        ))}
        <rect x="562" y="148" width="248" height="12" fill="#6b4e32" />
        {shelfBooks(0, 9, 580, 262)}
        {shelfBooks(3, 9, 580, 366)}
        {shelfBooks(6, 8, 580, 470)}
        {/* A framed photo standing on the middle shelf. */}
        <g transform="rotate(-2 754 330)">
          <rect x="726" y="298" width="56" height="66" fill="#3a2a1a" />
          <rect x="732" y="304" width="44" height="46" fill="#2c3844" />
          <circle cx="754" cy="322" r="10" fill="#4a5a68" />
        </g>
        {/* Trailing plant on top. */}
        <rect x="596" y="116" width="52" height="34" rx="5" fill="#2a1d14" />
        <path d="M604 116 C588 84 600 58 616 48 C608 74 606 96 612 116 Z" fill="#1d2a20" />
        <path d="M624 116 C642 88 640 60 628 46 C648 62 656 92 646 116 Z" fill="#18231b" />
        {/* Vine falling down the side of the shelf. */}
        <path d="M600 140 C584 190 590 250 578 300" fill="none" stroke="#1a2620" strokeWidth="4" strokeLinecap="round" />
        {[168, 206, 246, 284].map((y, i) => (
          <ellipse key={y} cx={592 - i * 3} cy={y} rx="9" ry="6" fill="#1d2a20" transform={`rotate(${-20 + i * 9} ${592 - i * 3} ${y})`} />
        ))}
      </g>

      {/* ---------------- Chair -------------------------------------------- */}
      <g id="obj-chair">
        <path d="M96 470 C96 452 118 442 268 442 C418 442 440 452 440 470 L432 792 L104 792 Z" fill="#0b0a09" />
        <path d="M110 478 C110 464 130 456 268 456 C406 456 426 464 426 478 L418 700 L118 700 Z" fill="#111013" />
        {/* Post and star base. */}
        <rect x="252" y="782" width="30" height="62" fill="#0a090b" />
        <path d="M140 878 L262 836 L278 836 L400 878 L392 890 L268 856 L148 890 Z" fill="#0a090b" />
        <ellipse cx="268" cy="848" rx="38" ry="12" fill="#0d0c0f" />
      </g>

      {/* ---------------- Desk ---------------------------------------------- */}
      <g id="obj-desk" className="paintable" filter="url(#f-paint-fine)">
        {/* Top surface, in slight perspective. */}
        <path d="M352 540 L836 528 L864 600 L326 616 Z" fill="url(#g-wood)" />
        {/* Grain dragged along the surface. */}
        <g opacity="0.16">
          {[556, 570, 584, 598].map((y, i) => (
            <path key={y} d={`M340 ${y} L852 ${y - 6 + i * 2}`} stroke="#2a1d12" strokeWidth="3" />
          ))}
        </g>
        {/* The key light pooling on the wood in front of the laptop. */}
        <ellipse cx="560" cy="576" rx="230" ry="42" fill="url(#g-key-bloom)" opacity="0.5" filter="url(#f-bloom-sm)" className="key-bloom" />
        {/* Front edge and legs. */}
        <path d="M326 616 L864 600 L864 630 L326 646 Z" fill="url(#g-wood-dark)" />
        <rect x="356" y="640" width="20" height="240" fill="#1a120b" />
        <rect x="824" y="624" width="20" height="240" fill="#1a120b" />
        {/* Back edge catching the light — one line is what turns a polygon into
            a surface. */}
        <path d="M352 540 L836 528 L836 534 L352 546 Z" fill="#ffd9a4" opacity="0.28" />
      </g>
    </g>
  );
}
