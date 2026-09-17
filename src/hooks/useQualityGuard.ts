import { useEffect, useState } from 'react';

/**
 * Drops the expensive painterly filters on hardware that cannot afford them.
 *
 * The room's look leans on SVG filters — turbulence displacement for the
 * painted edges, large gaussian blooms for the light. On a GPU those are
 * cheap. In software rasterisation, or on a weak integrated chip, they are
 * not, and there is no way to know which you are on from a media query:
 * screen size does not tell you rendering power.
 *
 * So measure instead of guess. Sample real frame times shortly after the room
 * settles, and if the page cannot hold a reasonable rate, switch to the lite
 * path — same composition, same motion, just without the filters that cost the
 * most and add the least at speed.
 *
 * It runs once. A page that keeps re-deciding would flicker between looks.
 */
export function useQualityGuard({ enabled }: { enabled: boolean }): boolean {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let frames = 0;
    let raf = 0;
    let start = 0;
    let stopped = false;

    // Let the intro and first paint settle first — measuring during mount
    // would condemn every machine on its slowest second.
    const begin = window.setTimeout(() => {
      start = performance.now();
      const tick = () => {
        if (stopped) return;
        frames++;
        const elapsed = performance.now() - start;
        if (elapsed < 1100) {
          raf = requestAnimationFrame(tick);
          return;
        }
        const fps = frames / (elapsed / 1000);
        // 38 is comfortably under a 60Hz target but well above anything that
        // reads as smooth, so it only catches machines genuinely struggling.
        if (fps < 38) setLite(true);
      };
      raf = requestAnimationFrame(tick);
    }, 2600);

    return () => {
      stopped = true;
      window.clearTimeout(begin);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return lite;
}
