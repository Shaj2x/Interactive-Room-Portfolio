import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** Exit is faster than entry — the user has already decided to leave. */
const EXIT_MS = 220;

interface Props {
  title: string;
  /** Sits in the rail — the object in the room you clicked to get here. */
  eyebrow: string;
  /** Position in the room's tab order. Printed in the rail as 01–08. */
  index: number;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The frame every section shares: an editorial sheet that slides in against
 * the right edge of the room, with a left rail carrying the section number,
 * the object you clicked, and the way back.
 *
 * It is deliberately not a centred rounded dialog. The rail gives the page a
 * spine, the asymmetric grid gives the prose a real measure, and the room
 * stays visible down the left-hand side so you never lose where you are.
 *
 * Motion, and only where it earns its place:
 *   - open: the sheet slides from the edge it is anchored to, and the title
 *     is wiped up from its own baseline rather than faded.
 *   - close: the same path reversed, at a third of the duration.
 *   - body: a 50ms stagger, once, on open.
 * Content stagger lives on `.stagger > *` in sections.css, not on inline
 * styles, so adding a paragraph needs no bookkeeping.
 */
export function SectionShell({ title, eyebrow, index, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const [closing, setClosing] = useState(false);
  const leaving = useRef(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Play the exit before unmounting. Guarded, because Escape, the rail button
  // and a click on the room can all arrive inside the same 220ms.
  const requestClose = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    if (reduced) {
      onClose();
      return;
    }
    setClosing(true);
    window.setTimeout(onClose, EXIT_MS);
  }, [onClose, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
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
  }, [requestClose]);

  return (
    <div
      className="section-backdrop"
      data-state={closing ? 'closing' : 'open'}
      onPointerDown={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        className="section-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
      >
        <div className="sheet-rail" aria-hidden="true">
          <span className="rail-index">{String(index).padStart(2, '0')}</span>
          <span className="rail-rule" />
          <span className="rail-eyebrow">{eyebrow}</span>
        </div>

        <div className="section-scroll">
          <header className="section-head">
            <p className="eyebrow">
              <span className="eyebrow-index">{String(index).padStart(2, '0')}</span>
              {eyebrow}
            </p>
            <h1 className="section-title" tabIndex={-1} ref={headingRef}>
              <span className="title-ink">{title}</span>
            </h1>
          </header>
          {children}
        </div>

        <button type="button" className="back-btn" onClick={requestClose}>
          <span className="back-arrow" aria-hidden="true">
            ←
          </span>
          <span className="back-text">Back to the room</span>
        </button>
      </div>
    </div>
  );
}
