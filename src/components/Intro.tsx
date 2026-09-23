import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { identity } from '../content/profile';
import './intro.css';

interface Props {
  onDone: () => void;
  reducedMotion: boolean;
}

/**
 * First load: the room powers on. Near-black, a rule draws across the top of
 * the frame, the name is wiped up a line at a time, and the laptop glow blooms
 * in last — the light the whole scene is lit by should be the last thing to
 * arrive.
 *
 * The title card is set into the bottom-left corner rather than the middle of
 * the screen, so it reads as a masthead over the room instead of a splash.
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
          '.intro-rule',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: 'power3.out' },
          0.1,
        )
        // Wiped up from the baseline, a word at a time. A fade on type this
        // size reads as something still loading; a wipe reads as a reveal.
        .fromTo(
          '.intro-word',
          { clipPath: 'inset(0 0 100% 0)', yPercent: 8 },
          {
            clipPath: 'inset(0 0 -20% 0)',
            yPercent: 0,
            duration: 0.78,
            ease: 'power3.out',
            stagger: 0.09,
          },
          0.3,
        )
        .fromTo(
          '.intro-sub',
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          0.85,
        )
        .fromTo(
          '.intro-meta',
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power2.out' },
          1.05,
        )
        // The bloom: the laptop coming on, and the cue to leave.
        .to('.intro-bloom', { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' }, 0.95)
        .to('.intro-copy', { opacity: 0, duration: 0.45, ease: 'power2.out' }, 2.05)
        .to('.intro', { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 2.2);
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

  const words = identity.name.split(' ');

  return (
    <div className="intro" ref={root} role="presentation">
      <div className="intro-veil" />
      <div className="intro-bloom" />

      <div className="intro-copy">
        <div className="intro-rule" />
        <p className="intro-name" aria-label={identity.name}>
          {words.map((word) => (
            <span className="intro-line" key={word}>
              <span className="intro-word">{word}</span>
            </span>
          ))}
        </p>
        <p className="intro-sub">{identity.positioning}</p>
        <p className="intro-meta">
          <span>{identity.location}</span>
          <span className="intro-meta-sep" aria-hidden="true">
            /
          </span>
          <span>Portfolio</span>
        </p>
      </div>

      <button type="button" className="intro-skip" onClick={onDone}>
        Skip
      </button>
    </div>
  );
}
