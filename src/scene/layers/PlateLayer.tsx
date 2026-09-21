import { plateGlass, plateLights, plateSrc } from '../plate';

/**
 * The painted room, plus everything that has to move re-created over it.
 *
 * A painting is one flat picture: nothing in it can breathe, and there are no
 * separated layers to parallax. So the plate is the far plane, and the light
 * and weather are rebuilt as animated overlays on top — driven by the same CSS
 * keyframes the SVG room uses, so the two art paths animate identically.
 */

interface Props {
  /** Easter egg: the lamp is off and the warm sources drop out. */
  lampOn: boolean;
}

/**
 * Rain, in three depth bands.
 *
 * All of it falls beyond the glass, so the nearer a band is the faster,
 * brighter and longer its drops — that difference is the only depth cue
 * available on a flat plate, and without it the rain reads as a pattern
 * painted on the window rather than weather behind it. Nothing is bright: the
 * plate's own streaks on the glass are the foreground, and these sit under
 * them.
 *
 * Deterministic rather than random, so the pattern is identical on every load.
 * The spread of delays and durations is what stops three dozen drops reading
 * as a repeating band.
 */
const RAIN_BANDS = [
  { id: 'far', count: 13, width: 0.55, opacity: 0.1, len: 9, dur: [4.6, 5.8] },
  { id: 'mid', count: 11, width: 0.8, opacity: 0.15, len: 14, dur: [3.4, 4.3] },
  { id: 'near', count: 8, width: 1.1, opacity: 0.2, len: 21, dur: [2.4, 3.1] },
] as const;

/** Drops start above the pane so they are already falling when they appear. */
const RAIN_ENTRY = 34;

export function PlateLayer({ lampOn }: Props) {
  if (!plateSrc) return null;

  return (
    <g id="layer-plate">
      {/* The painting. Drawn into the same 1600x900 space as the SVG room, so
          hotspots, parallax and portrait reframing are unchanged. */}
      <image
        href={plateSrc}
        x="0"
        y="0"
        width="1600"
        height="900"
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Rain, clipped to each pane of glass on its own. The mullion between
          them and the frame around them are solid, so rain crossing those
          would read as falling on the picture instead of behind the window. */}
      <defs>
        {plateGlass.map((pane) => (
          <clipPath key={pane.id} id={`clip-glass-${pane.id}`}>
            <rect x={pane.x} y={pane.y} width={pane.w} height={pane.h} />
          </clipPath>
        ))}
      </defs>

      {plateGlass.map((pane) => (
        <g key={pane.id} clipPath={`url(#clip-glass-${pane.id})`}>
          {RAIN_BANDS.map((band, bi) => (
            // The band's own opacity lives on the group, because the keyframes
            // own the drops' opacity and would otherwise overwrite it.
            <g key={band.id} opacity={band.opacity}>
              {/* Counts are per unit of width, so the narrow pane does not end
                  up raining twice as hard as the wide one. */}
              {Array.from({ length: Math.round((band.count * pane.w) / 183) }, (_, i) => {
                const seed = bi * 97 + i * 53;
                const x = pane.x + (pane.w * ((seed * 37) % 100)) / 100;
                const y = pane.y - RAIN_ENTRY;
                const dur = band.dur[0] + (((seed * 7) % 13) / 12) * (band.dur[1] - band.dur[0]);
                return (
                  <line
                    key={i}
                    className="plate-raindrop"
                    x1={x}
                    y1={y}
                    x2={x - 1.4}
                    y2={y + band.len}
                    stroke="#a9cfe8"
                    strokeWidth={band.width}
                    style={{
                      animationDelay: `${(((seed * 13) % 53) / 10).toFixed(2)}s`,
                      animationDuration: `${dur.toFixed(2)}s`,
                    }}
                  />
                );
              })}
            </g>
          ))}
        </g>
      ))}

      {/* The lights that breathe. Screen-blue keeps going when the lamp is off;
          the warm sources are exactly what the easter egg switches out. */}
      {plateLights.map((l) => {
        // The lamp easter egg puts out every warm source in the room.
        if (!lampOn && l.kind === 'warm') return null;
        const warm = l.kind === 'warm';
        const fill = warm ? 'url(#g-candle-bloom)' : 'url(#g-cool-bloom)';
        return (
          <ellipse
            key={l.id}
            cx={l.cx}
            cy={l.cy}
            rx={l.rx}
            ry={l.ry}
            fill={fill}
            opacity={l.intensity}
            filter="url(#f-bloom-lg)"
            className={warm ? 'lamp-bloom' : 'key-bloom'}
            style={{ transformOrigin: `${l.cx}px ${l.cy}px` }}
          />
        );
      })}
    </g>
  );
}
