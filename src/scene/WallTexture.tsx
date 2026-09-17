/**
 * Plaster grain and paint mottling for the wall.
 *
 * This used to be an SVG turbulence filter over the full 1600x900 wall. It
 * looked right and cost about 45fps: the wall sits inside a layer whose
 * transform is rewritten every frame by the parallax, so the browser re-ran
 * turbulence, displacement and blur on every frame of it.
 *
 * As a plain element with a static background image it is rasterised once and
 * then only ever composited, which is free by comparison. It still parallaxes
 * — it carries `data-depth` like any other layer — because moving a finished
 * bitmap is cheap; regenerating one is not.
 */
export function WallTexture() {
  return (
    <div className="wall-texture" data-depth={0.15} aria-hidden="true">
      <div className="wall-grain" />
      <div className="wall-mottle" />
    </div>
  );
}
