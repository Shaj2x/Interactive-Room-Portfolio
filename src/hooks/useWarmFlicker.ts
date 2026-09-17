import { useEffect } from 'react';

/**
 * Random flicker for every warm light in the room — candles, the desk lamp,
 * the door leak and the warm wash on the walls.
 *
 * CSS keyframes cannot do this: a keyframe loop repeats on a fixed period, and
 * the eye finds that period within a few seconds, at which point the room stops
 * feeling alive and starts feeling animated. Real flame is irregular, so the
 * timing here is irregular: each step waits a random interval and picks a new
 * brightness, with an occasional deeper "gust" dip.
 *
 * It writes `style.opacity` straight onto the handful of elements marked
 * `data-warm`, rather than setting a CSS variable on a shared parent — a
 * variable on the parent would invalidate styles for the whole SVG subtree on
 * every step, which is a lot of recalculation for six elements.
 */
export function useWarmFlicker(
  containerRef: React.RefObject<HTMLElement>,
  { disabled }: { disabled: boolean },
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const targets = Array.from(el.querySelectorAll<SVGElement>('[data-warm]'));
    if (targets.length === 0) return;

    // Each light carries its own base opacity and how much it is allowed to
    // move: a candle gutters hard, a wall wash barely breathes.
    const lights = targets.map((node) => ({
      node,
      base: Number(node.dataset.warm ?? 1),
      swing: Number(node.dataset.warmSwing ?? 0.22),
      value: Number(node.dataset.warm ?? 1),
    }));

    if (disabled) {
      lights.forEach((l) => (l.node.style.opacity = String(l.base)));
      return;
    }

    let timer = 0;
    let stopped = false;

    const step = () => {
      if (stopped) return;

      // Most steps are a small wander. Roughly one in nine is a gust: a deeper,
      // longer dip, like a draught crossing the room.
      const gust = Math.random() < 0.11;

      for (const l of lights) {
        const spread = gust ? l.swing * 2.1 : l.swing;
        const target = l.base * (1 - Math.random() * spread);
        // Ease toward the target instead of jumping, so a flame gutters rather
        // than strobes.
        l.value += (target - l.value) * (gust ? 0.75 : 0.55);
        l.node.style.opacity = l.value.toFixed(3);
      }

      // Irregular cadence is the whole point — a fixed interval reads as a loop.
      const wait = gust ? 190 + Math.random() * 260 : 70 + Math.random() * 150;
      timer = window.setTimeout(step, wait);
    };

    step();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      lights.forEach((l) => l.node.style.removeProperty('opacity'));
    };
  }, [containerRef, disabled]);
}
