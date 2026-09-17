import { plateLights, plateSrc, plateWindow } from '../plate';

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

/** Deterministic rain, laid over wherever the painting's window is. */
const RAIN = Array.from({ length: 26 }, (_, i) => ({
  t: (i * 37) % 100,
  delay: (i * 0.37) % 4.4,
  dur: 2.4 + ((i * 7) % 13) / 10,
  len: 14 + ((i * 11) % 20),
}));

export function PlateLayer({ lampOn }: Props) {
  if (!plateSrc) return null;
  // Bound to a local so the narrowing survives into the map callbacks below.
  const win = plateWindow;

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

      {/* Rain on the painting's window. */}
      {win && (
        <g clipPath="url(#clip-plate-window)">
          <clipPath id="clip-plate-window">
            <rect x={win.x} y={win.y} width={win.w} height={win.h} />
          </clipPath>
          {RAIN.map((d, i) => (
            <line
              key={i}
              x1={win.x + (win.w * d.t) / 100}
              y1={win.y}
              x2={win.x + (win.w * d.t) / 100 - 6}
              y2={win.y + d.len}
              stroke="#9fd4f0"
              strokeWidth="1.1"
              opacity="0.2"
              className="raindrop"
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
            />
          ))}
        </g>
      )}

      {/* The lights that breathe. Screen-blue keeps going when the lamp is off;
          the warm sources are exactly what the easter egg switches out. */}
      {plateLights.map((l) => {
        if (!lampOn && l.kind === 'warm') return null;
        const fill =
          l.kind === 'screen'
            ? 'url(#g-screen-bloom)'
            : l.kind === 'warm'
              ? 'url(#g-lamp-bloom)'
              : 'url(#g-screen-bloom)';
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
            className={l.kind === 'screen' ? 'screen-bloom' : 'lamp-bloom'}
            style={{ transformOrigin: `${l.cx}px ${l.cy}px` }}
          />
        );
      })}
    </g>
  );
}
