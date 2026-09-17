import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { identity } from '../content/profile';
import './intro.css';

interface Props {
  onDone: () => void;
  reducedMotion: boolean;
}

/**
 * First load: the room powers on. Near-black, the wall resolves, the name
 * settles, and the laptop glow blooms in last — the light the whole scene is
 * lit by should be the last thing to arrive.
 *
 * ~2.6s and skippable by click, key or the explicit control. GSAP is here
 * because this is an orchestrated sequence across several elements with
 * overlapping timings, which is exactly what a timeline is for; the ambient
 * loops behind it stay in CSS.
 */
export function Intro({ onDone, reducedMotion }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      onDone();
    };

    if (reducedMotion) {
      // No power-on theatre for reduced motion: a short fade and out of the way.
      const t = window.setTimeout(finish, 450);
      return () => window.clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish });
      tl.to('.intro-veil', { opacity: 0.55, duration: 0.7, ease: 'power2.out' })
        .fromTo(
          '.intro-name',
          { opacity: 0, filter: 'blur(14px)', y: 10 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.9, ease: 'power3.out' },
          0.25,
        )
        .fromTo(
          '.intro-sub',
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          0.7,
        )
        // The bloom: the laptop coming on, and the cue to leave.
        .to('.intro-bloom', { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' }, 0.9)
        .to('.intro-name, .intro-sub', { opacity: 0, duration: 0.45, ease: 'power2.in' }, 1.95)
        .to('.intro', { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 2.1);
    }, root);

    return () => ctx.revert();
  }, [onDone, reducedMotion]);

  // Any interaction skips. The intro must never be something to sit through.
  useEffect(() => {
    const skip = () => {
      if (!done.current) {
        done.current = true;
        onDone();
      }
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [onDone]);

  return (
    <div className="intro" ref={root} role="presentation">
      <div className="intro-veil" />
      <div className="intro-bloom" />
      <div className="intro-copy">
        <p className="intro-name">{identity.name}</p>
        <p className="intro-sub">{identity.positioning}</p>
      </div>
      <button type="button" className="intro-skip" onClick={onDone}>
        Skip
      </button>
    </div>
  );
}
