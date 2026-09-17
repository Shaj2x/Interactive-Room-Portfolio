/**
 * Bookshelf, desk and chair. Depth 0.35.
 * The bookshelf is the "Record" hotspot (education + work).
 */

/** Books: height, width and a muted spine colour. Fixed, not random. */
const BOOKS = [
  { w: 16, h: 74, c: '#213241' }, { w: 12, h: 68, c: '#2c2a3a' },
  { w: 20, h: 78, c: '#1c3038' }, { w: 14, h: 62, c: '#34291f' },
  { w: 11, h: 72, c: '#1f2a37' }, { w: 18, h: 66, c: '#2a3326' },
  { w: 13, h: 76, c: '#23303e' }, { w: 15, h: 60, c: '#302533' },
  { w: 19, h: 70, c: '#1a2b34' }, { w: 12, h: 74, c: '#2d3240' },
  { w: 16, h: 64, c: '#243a3a' }, { w: 14, h: 72, c: '#312a22' },
];

/** Lay books along a shelf, left to right, until they run out of room. */
function shelfBooks(startIndex: number, count: number, x0: number, baseline: number) {
  let x = x0;
  const out: JSX.Element[] = [];
  for (let i = 0; i < count; i++) {
    const b = BOOKS[(startIndex + i) % BOOKS.length];
    // Every fourth book leans; a perfectly ordered shelf reads as a template.
    const lean = i % 4 === 3 ? -8 : 0;
    out.push(
      <rect
        key={`${startIndex}-${i}`}
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

export function FurnitureLayer() {
  return (
    <g id="layer-furniture">
      {/* ---------------- Bookshelf → Record ------------------------------- */}
      <g id="obj-bookshelf">
        <rect x="58" y="436" width="236" height="388" rx="3" fill="url(#g-shelf)" />
        <rect
          x="58"
          y="436"
          width="236"
          height="388"
          rx="3"
          fill="none"
          stroke="#1b2935"
          strokeWidth="8"
        />
        {/* Three shelves */}
        {[560, 686, 812].map((y) => (
          <rect key={y} x="62" y={y} width="228" height="9" fill="#18242f" />
        ))}
        {/* Held well back: on a disciplined palette the books must not become
            the most colourful thing in the frame. */}
        <g opacity="0.55">
          {shelfBooks(0, 8, 74, 560)}
          {shelfBooks(4, 8, 74, 686)}
          {shelfBooks(8, 7, 74, 812)}
        </g>
        {/* A little of the screen light catches the top edge. */}
        <rect x="62" y="436" width="228" height="3" fill="#7fc0e8" opacity="0.14" />
      </g>

      {/* ---------------- Chair (behind the person) ------------------------ */}
      <g id="obj-chair">
        <rect x="548" y="462" width="252" height="252" rx="26" fill="#070d14" />
        <rect
          x="548"
          y="462"
          width="252"
          height="252"
          rx="26"
          fill="none"
          stroke="#131f2a"
          strokeWidth="5"
        />
      </g>

      {/* ---------------- Desk --------------------------------------------- */}
      <g id="obj-desk">
        {/* Top surface, in slight perspective */}
        <path d="M320 622 L1348 622 L1400 700 L300 700 Z" fill="url(#g-desk)" />
        {/* The screen's reflection on the desk, right under the laptop. */}
        <ellipse
          cx="1046"
          cy="666"
          rx="250"
          ry="40"
          fill="#8fd2f5"
          opacity="0.09"
          filter="url(#f-bloom-sm)"
          className="screen-bloom"
        />
        {/* Front face + legs */}
        <rect x="300" y="700" width="1100" height="44" fill="url(#g-desk-front)" />
        <rect x="336" y="744" width="22" height="156" fill="#070d13" />
        <rect x="1342" y="744" width="22" height="156" fill="#070d13" />
        {/* The lamp's warm pool on the left of the surface, opposite the screen. */}
        <ellipse cx="470" cy="660" rx="200" ry="38" fill="#ffb567" opacity="0.07" filter="url(#f-bloom-sm)" />
        {/* Back edge catching the key light, and the front lip catching a little
            less — two lines are what make a flat polygon read as a surface. */}
        <path d="M320 622 L1348 622 L1348 627 L320 627 Z" fill="#9fd4f0" opacity="0.3" />
        <path d="M300 697 L1400 697 L1400 703 L300 703 Z" fill="#8fc6e4" opacity="0.14" />
      </g>
    </g>
  );
}
