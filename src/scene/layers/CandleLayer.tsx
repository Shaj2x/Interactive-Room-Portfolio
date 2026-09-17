/**
 * Candles. Three of them, at different depths and heights so the warm light in
 * the room comes from more than one place.
 *
 * Each candle is body + wick + flame + a bloom. The flame's shape animates on
 * CSS keyframes with durations that share no common multiple (2.3s / 3.1s /
 * 4.7s), so the three never sync up into a visible pattern; the *brightness* is
 * driven separately by useWarmFlicker, which is genuinely random. Shape loops
 * cheaply, brightness flickers irregularly, and between them the flame reads as
 * a flame.
 */

interface Candle {
  id: string;
  /** Base of the candle. */
  x: number;
  y: number;
  /** Candle body height and width. */
  h: number;
  w: number;
  /** Bloom radius and its resting opacity. */
  glow: number;
  warm: number;
  /** Shape-loop duration; kept mutually prime-ish across candles. */
  dur: number;
}

const CANDLES: Candle[] = [
  // On the bookshelf's middle shelf, beside the framed photo.
  { id: 'shelf', x: 692, y: 366, h: 40, w: 15, glow: 118, warm: 0.46, dur: 3.1 },
  // On the desk, right of the mug, at the near edge.
  { id: 'desk', x: 776, y: 556, h: 54, w: 19, glow: 168, warm: 0.56, dur: 2.3 },
  // On the low shelf far left — mostly bloom, it lifts the dark corner.
  { id: 'low', x: 96, y: 512, h: 34, w: 16, glow: 126, warm: 0.42, dur: 4.7 },
];

export function CandleLayer() {
  return (
    <g id="layer-candles">
      {CANDLES.map((c) => {
        const topY = c.y - c.h;
        const flameY = topY - 4;
        return (
          <g key={c.id} className="candle">
            {/* Bloom, under everything, so the flame sits inside its own light. */}
            <ellipse
              cx={c.x}
              cy={flameY - 6}
              rx={c.glow}
              ry={c.glow * 0.86}
              fill="url(#g-candle-bloom)"
              filter="url(#f-bloom-lg)"
              data-warm={c.warm}
              data-warm-swing="0.3"
            />
            {/* Wax */}
            <rect x={c.x - c.w / 2} y={topY} width={c.w} height={c.h} rx={2} fill="#2a2018" />
            <rect x={c.x - c.w / 2} y={topY} width={c.w} height={c.h} rx={2} fill="url(#g-wax)" />
            <ellipse cx={c.x} cy={topY} rx={c.w / 2} ry={3.4} fill="#4a382a" />
            {/* Wick */}
            <rect x={c.x - 1} y={flameY - 2} width={2} height={6} fill="#1a1410" />
            {/* Flame: an outer teardrop and a hot core. */}
            <g
              className="flame"
              style={{
                animationDuration: `${c.dur}s`,
                transformOrigin: `${c.x}px ${flameY}px`,
              }}
            >
              <path
                d={`M${c.x} ${flameY - 21} C${c.x + 8} ${flameY - 11} ${c.x + 7} ${flameY - 2}
                    ${c.x} ${flameY} C${c.x - 7} ${flameY - 2} ${c.x - 8} ${flameY - 11}
                    ${c.x} ${flameY - 21} Z`}
                fill="#ffb95e"
                filter="url(#f-soft)"
                data-warm="0.92"
                data-warm-swing="0.34"
              />
              <path
                d={`M${c.x} ${flameY - 13} C${c.x + 4} ${flameY - 7} ${c.x + 3.5} ${flameY - 2}
                    ${c.x} ${flameY - 1} C${c.x - 3.5} ${flameY - 2} ${c.x - 4} ${flameY - 7}
                    ${c.x} ${flameY - 13} Z`}
                fill="#fff0cf"
                data-warm="1"
                data-warm-swing="0.26"
              />
            </g>
          </g>
        );
      })}
    </g>
  );
}
