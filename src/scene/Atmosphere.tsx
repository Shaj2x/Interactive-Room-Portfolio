/**
 * Non-SVG atmosphere laid over the whole stage: vignette and film grain.
 * Kept out of the SVG so it never moves with parallax — grain that parallaxes
 * reads as a texture on a wall instead of grain in a lens.
 */
export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="vignette" />
      <div className="grain" />
    </div>
  );
}
