import { DEPTH } from './hotspots';
import { plateRoomBreath, platePulses, plateSrc } from './plate';

/**
 * The room's breath and its pulsing lights, as HTML over the stage rather
 * than SVG inside it.
 *
 * They started life as `<rect>`s in the plate group, which worked and cost
 * about five frames a second: animating anything inside the scene makes the
 * browser repaint the scene, filters and all, on every frame of the animation.
 * Out here each one is its own compositor layer animating nothing but opacity,
 * which is the cheapest thing a browser does.
 *
 * `data-depth` matches the plate's, so the parallax moves them with the light
 * they sit on instead of letting them drift off it.
 *
 * Positions are the same 1600 x 900 scene coordinates as everything else,
 * converted to percentages — the stage is locked to the scene's 16:9, so the
 * two spaces line up exactly.
 */
export function PlatePulses({ lampOn }: { lampOn: boolean }) {
  if (!plateSrc) return null;

  return (
    <>
      {/* The whole room, breathing. Outside the parallax container: it covers
          everything, so it must not drift with the layers underneath it. It
          stays when the lamp goes out — the room is still there. */}
      <div className={`room-dim ${plateRoomBreath.animation}`} aria-hidden="true" />

      {/* Out with the lamp, like every other warm source in the room. */}
      {lampOn && (
        <div className="plate-dims" data-depth={DEPTH.wall} aria-hidden="true">
          {platePulses.map((p) => (
            <div
              key={p.id}
              className={`plate-dim ${p.animation}${p.soft ? ' is-soft' : ''}`}
              style={{
                left: `${(p.x / 1600) * 100}%`,
                top: `${(p.y / 900) * 100}%`,
                width: `${(p.w / 1600) * 100}%`,
                height: `${(p.h / 900) * 100}%`,
                borderRadius: p.rx ? `${p.rx}px` : undefined,
                opacity: p.rest,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
