import { useEffect, useState } from 'react';

/**
 * Tracks `prefers-reduced-motion`, live. Everything ambient in the room checks
 * this. Reduced motion here means *gentler and fewer*, not zero: the scene
 * still cross-fades, it just stops drifting, flickering and parallaxing.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** True on coarse pointers / narrow viewports, where the scene is reframed. */
export function useIsCompact(): boolean {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 820px)').matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)');
    const onChange = () => setCompact(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}
