import { DEPTH } from './hotspots';
import { plateFlickers, plateSrc } from './plate';

/**
 * The flickering lights, as HTML over the stage rather than SVG inside it.
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
export function PlateFlickers({ lampOn }: { lampOn: boolean }) {
  // Out with the lamp, like every other warm source in the room.
  if (!plateSrc || !lampOn) return null;

  return (
    <div className="plate-dims" data-depth={DEPTH.wall} aria-hidden="true">
      {plateFlickers.map((f) => (
        <div
          key={f.id}
          className={`plate-dim ${f.animation}`}
          style={{
            left: `${(f.x / 1600) * 100}%`,
            top: `${(f.y / 900) * 100}%`,
            width: `${(f.w / 1600) * 100}%`,
            height: `${(f.h / 900) * 100}%`,
            borderRadius: f.rx ? `${f.rx}px` : undefined,
            opacity: f.rest,
          }}
        />
      ))}
    </div>
  );
}
