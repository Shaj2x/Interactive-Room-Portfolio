import { useEffect, useMemo } from 'react';

/**
 * The refraction half of the liquid glass material (styles/glass.css holds
 * the rest). It is one SVG filter, used as a backdrop-filter, that bends
 * whatever sits behind a glass element near its rim, the way the thick edge
 * of a lens does. The centre stays true and the edges pull the backdrop
 * inward.
 *
 * Only Chromium renders SVG filters inside backdrop-filter. Elsewhere the
 * declaration would be dropped outright, so the filter is switched on with a
 * class on <html> after a feature check. Other browsers keep the frosted
 * glass without the bend.
 */

/** Displacement map: red shifts x and green shifts y. 128 means no shift. */
function lensMap(size = 128, edge = 0.22): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(size, size);
  const falloff = (t: number) => {
    // 1 at the rim, easing to 0 by `edge` of the way in.
    const k = Math.max(0, 1 - t / edge);
    return k * k * (3 - 2 * k);
  };
  for (let y = 0; y < size; y++) {
    const v = (y + 0.5) / size;
    const dy = (v < 0.5 ? 1 : -1) * falloff(Math.min(v, 1 - v));
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const dx = (u < 0.5 ? 1 : -1) * falloff(Math.min(u, 1 - u));
      const i = (y * size + x) * 4;
      img.data[i] = 128 + 127 * dx;
      img.data[i + 1] = 128 + 127 * dy;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

function supportsBackdropSvgFilters(): boolean {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } })
    .userAgentData?.brands;
  return Boolean(brands?.some((b) => b.brand === 'Chromium'));
}

export function LiquidGlassFilter() {
  const map = useMemo(lensMap, []);

  useEffect(() => {
    if (!map || !supportsBackdropSvgFilters()) return;
    const root = document.documentElement;
    root.classList.add('lg-refract');
    return () => root.classList.remove('lg-refract');
  }, [map]);

  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <filter
        id="lg-refract"
        x="0"
        y="0"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feImage href={map} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="lens" />
        <feDisplacementMap in="SourceGraphic" in2="lens" scale="26" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
