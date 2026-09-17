/**
 * Bookshelf, desk, chair, bed and the low shelf at the left. Depth 0.35.
 * The bookshelf is the "Record" hotspot; everything else is scenery.
 */

/** Books: width, height, spine colour. Warm, muted, never the brightest thing. */
const BOOKS = [
  { w: 15, h: 62, c: '#8c5a33' }, { w: 11, h: 56, c: '#c8b08a' },
  { w: 19, h: 66, c: '#7d3128' }, { w: 13, h: 50, c: '#a8794a' },
  { w: 10, h: 60, c: '#5c4a38' }, { w: 17, h: 54, c: '#b49a72' },
  { w: 12, h: 64, c: '#46545e' }, { w: 14, h: 48, c: '#8e3f38' },
  { w: 18, h: 58, c: '#6d5638' }, { w: 11, h: 62, c: '#d0bc98' },
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
        <path d="M1086 566 L1462 530 L1470 760 L1080 772 Z" fill="#0a0c11" />
        {/* Rumpled bedding — a few soft folds catching the window's cool light. */}
        <path d="M1096 590 C1180 562 1280 550 1380 544 C1424 542 1454 544 1466 550 L1468 606 C1398 594 1258 600 1100 632 Z" fill="#111620" />
        <path d="M1102 656 C1202 630 1324 618 1444 618 L1448 668 C1334 666 1214 680 1106 704 Z" fill="#0d1118" />
        <path d="M1090 726 L1468 704 L1470 760 L1080 772 Z" fill="#090a0e" />
      </g>

      {/* ---------------- Low shelf, far left ------------------------------- */}
      <g id="obj-lowshelf">
        <rect x="-10" y="600" width="140" height="15" fill="#2c1f14" />
        <rect x="-10" y="615" width="140" height="150" fill="#120d09" />
        {/* Pen cup */}
        <rect x="58" y="548" width="36" height="52" rx="4" fill="#2c2016" />
        {[64, 72, 80, 86].map((x, i) => (
          <line key={x} x1={x} y1={548} x2={x - 3 + i} y2={514 - i * 5} stroke="#5a4632" strokeWidth="3" strokeLinecap="round" />
        ))}
        {/* A couple of books lying flat */}
        <rect x="-10" y="578" width="58" height="10" fill="#4a3826" />
        <rect x="-6" y="568" width="50" height="10" fill="#3a4740" />
        {/* Plant */}
        <path d="M20 548 C4 508 22 476 38 462 C33 492 33 522 40 548 Z" fill="#24352a" />
        <path d="M38 548 C54 512 50 480 38 462 C56 478 70 512 60 548 Z" fill="#1d2b22" />
        <rect x="8" y="548" width="56" height="52" rx="5" fill="#2f2015" />
      </g>

      {/* ---------------- Bookshelf → Record --------------------------------- */}
      <g id="obj-bookshelf" className="paintable" filter="url(#f-paint-fine)">
        <rect x="592" y="198" width="256" height="452" fill="url(#g-wood)" />
        <rect x="600" y="206" width="240" height="436" fill="#140f0a" />
        {/* Shelf boards */}
        {[318, 428, 538].map((y) => (
          <rect key={y} x="596" y={y} width="248" height="11" fill="#5a4128" />
        ))}
        <rect x="592" y="198" width="256" height="13" fill="#7d5c3a" />
        {shelfBooks(0, 9, 610, 318)}
        {shelfBooks(3, 9, 610, 428)}
        {shelfBooks(6, 8, 610, 538)}
        {/* A framed photo standing on the middle shelf. */}
        <g transform="rotate(-2 800 286)">
          <rect x="772" y="252" width="56" height="68" fill="#4a3421" />
          <rect x="778" y="258" width="44" height="48" fill="#3a4a58" />
          <circle cx="800" cy="278" r="10" fill="#6a7a88" />
        </g>
        {/* A small dark object on the top shelf, as in the reference. */}
        <ellipse cx="792" cy="186" rx="13" ry="15" fill="#1c1712" />
        <rect x="783" y="194" width="18" height="10" rx="2" fill="#221b14" />
        {/* Trailing plant on top. */}
        <rect x="612" y="162" width="54" height="36" rx="5" fill="#2f2015" />
        <path d="M620 162 C602 126 616 96 634 84 C625 114 623 138 630 162 Z" fill="#24352a" />
        <path d="M642 162 C662 130 660 98 646 82 C668 100 678 132 666 162 Z" fill="#1d2b22" />
        {/* Vine falling down the side of the shelf. */}
        <path d="M614 192 C596 250 602 316 588 372" fill="none" stroke="#203028" strokeWidth="4" strokeLinecap="round" />
        {[224, 268, 312, 354].map((y, i) => (
          <ellipse key={y} cx={606 - i * 3} cy={y} rx="10" ry="6.5" fill="#24352a" transform={`rotate(${-20 + i * 9} ${606 - i * 3} ${y})`} />
        ))}
      </g>

      {/* ---------------- Chair -------------------------------------------- */}
      <g id="obj-chair">
        <path d="M86 580 C86 560 112 548 308 548 C504 548 530 560 530 580 L520 900 L96 900 Z" fill="#0b0a09" />
        <path d="M104 590 C104 574 128 564 308 564 C488 564 512 574 512 590 L504 830 L112 830 Z" fill="#111013" />
        {/* Post and star base. */}
        <rect x="292" y="856" width="32" height="44" fill="#0a090b" />
        
        
      </g>

      {/* ---------------- Desk ---------------------------------------------- */}
      <g id="obj-desk" className="paintable" filter="url(#f-paint-fine)">
        {/* Top surface, in slight perspective. */}
        <path d="M300 620 L862 606 L892 690 L272 706 Z" fill="url(#g-wood)" />
        {/* Grain dragged along the surface. */}
        <g opacity="0.16">
          {[638, 654, 670, 686].map((y, i) => (
            <path key={y} d={`M290 ${y} L880 ${y - 8 + i * 2}`} stroke="#2a1d12" strokeWidth="3" />
          ))}
        </g>
        {/* The key light pooling on the wood in front of the laptop. */}
        <ellipse cx="560" cy="660" rx="250" ry="44" fill="url(#g-key-bloom)" opacity="0.5" filter="url(#f-bloom-sm)" className="key-bloom" />
        {/* Front edge and legs. */}
        <path d="M272 706 L892 690 L892 726 L272 742 Z" fill="url(#g-wood-dark)" />
        <rect x="316" y="736" width="22" height="164" fill="#1a120b" />
        <rect x="846" y="720" width="22" height="180" fill="#1a120b" />
        {/* Back edge catching the light — one line is what turns a polygon into
            a surface. */}
        <path d="M300 620 L862 606 L862 612 L300 626 Z" fill="#ffd9a4" opacity="0.16" />
      </g>
    </g>
  );
}
