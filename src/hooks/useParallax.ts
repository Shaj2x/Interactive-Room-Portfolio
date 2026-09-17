import { useEffect, useRef } from 'react';

export interface ParallaxOptions {
  /** When true the hook does nothing and leaves layers at rest. */
  disabled: boolean;
  /** Scales the whole effect. Lower on small screens. */
  strength: number;
}

/**
 * 2.5D parallax. Pointer (or device tilt) drives a normalised -1..1 offset;
 * each layer translates by that offset times its own depth.
 *
 * Runs on rAF with a lerp so the layers ease toward the pointer rather than
 * snapping to it — a 1:1 mapping reads as jitter. Writes `transform` straight
 * onto each layer element rather than through a CSS variable on the parent,
 * because a variable on the parent restyles every child on every frame.
 */
export function useParallax(
  containerRef: React.RefObject<HTMLElement>,
  { disabled, strength }: ParallaxOptions,
) {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const layers = Array.from(
      el.querySelectorAll<HTMLElement | SVGElement>('[data-depth]'),
    );

    if (disabled) {
      layers.forEach((l) => l.style.removeProperty('transform'));
      return;
    }

    let frame = 0;

    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    // Mobile: a gentle version driven by device tilt, clamped hard so a phone
    // held at an angle does not park the room off-centre.
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      target.current.x = Math.max(-1, Math.min(1, e.gamma / 28));
      target.current.y = Math.max(-1, Math.min(1, (e.beta - 45) / 34));
    };

    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    const tick = () => {
      // Lerp at 0.075: slow enough to feel like weight, fast enough to track.
      current.current.x += (target.current.x - current.current.x) * 0.075;
      current.current.y += (target.current.y - current.current.y) * 0.075;

      for (const layer of layers) {
        const depth = Number(layer.dataset.depth ?? 0);
        const dx = -current.current.x * depth * 26 * strength;
        const dy = -current.current.y * depth * 16 * strength;
        layer.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('deviceorientation', onTilt);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onTilt);
      layers.forEach((l) => l.style.removeProperty('transform'));
    };
  }, [containerRef, disabled, strength]);
}
