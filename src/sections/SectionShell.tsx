import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  title: string;
  /** Sits above the title in small caps — the object you clicked. */
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The frame every section shares: a dark panel over the blurred room, a back
 * control, Escape to close, and focus moved in on open and trapped inside
 * while it is up.
 *
 * Content animates in with a staggered fade-and-rise. The stagger is done with
 * `animation-delay` on `.stagger > *` in sections.css, not per-element inline
 * styles, so adding a paragraph needs no bookkeeping.
 */
export function SectionShell({ title, eyebrow, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // Keep Tab inside the open section — behind it the room is inert.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="section-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="section-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
      >
        <div className="section-scroll">
          <header className="section-head stagger">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="section-title" tabIndex={-1} ref={headingRef}>
              {title}
            </h1>
          </header>
          {children}
        </div>

        <button type="button" className="back-btn" onClick={onClose}>
          <span aria-hidden="true">←</span> Back to the room
        </button>
      </div>
    </div>
  );
}
