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
 *
 * The loop sleeps once the layers have settled and wakes on the next pointer
 * or tilt event, so a room nobody is touching costs nothing.
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
      wake();
    };

    // Mobile: a gentle version driven by device tilt, clamped hard so a phone
    // held at an angle does not park the room off-centre.
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      target.current.x = Math.max(-1, Math.min(1, e.gamma / 28));
      target.current.y = Math.max(-1, Math.min(1, (e.beta - 45) / 34));
      wake();
    };

    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
      wake();
    };

    /**
     * Below this, the next frame would move a layer by a fraction of a pixel.
     * The lerp approaches its target asymptotically and never actually
     * arrives, so without a floor the loop would run for the life of the page
     * writing transforms that do not change anything.
     */
    const SETTLED = 0.0006;

    const tick = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;

      // Settled: write the resting position once, then stop. An idle room
      // should cost nothing — this page is one people leave open.
      const settled = Math.abs(dx) < SETTLED && Math.abs(dy) < SETTLED;
      if (settled) {
        current.current.x = target.current.x;
        current.current.y = target.current.y;
      } else {
        // Lerp at 0.075: slow enough to feel like weight, fast enough to track.
        current.current.x += dx * 0.075;
        current.current.y += dy * 0.075;
      }

      for (const layer of layers) {
        const depth = Number(layer.dataset.depth ?? 0);
        const lx = -current.current.x * depth * 26 * strength;
        const ly = -current.current.y * depth * 16 * strength;
        layer.style.transform = `translate3d(${lx.toFixed(2)}px, ${ly.toFixed(2)}px, 0)`;
      }

      if (settled) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    /** Restarts the loop if it went to sleep. Safe to call on every event. */
    function wake(): void {
      if (frame === 0) frame = requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('deviceorientation', onTilt);
    // One frame to write the resting transforms, after which it sleeps until
    // the pointer moves.
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
