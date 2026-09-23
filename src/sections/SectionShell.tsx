import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** Exit is faster than entry — the user has already decided to leave. */
const EXIT_MS = 220;

interface Props {
  title: string;
  /** Sits in the chapter mark — the object in the room you clicked. */
  eyebrow: string;
  /** Position in the room's tab order. Printed as 01–08. */
  index: number;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The frame every section shares: a chapter opening, split in two.
 *
 * The left half is transparent. The room's blurred plate shows straight through
 * it, and the chapter mark, the title and the way back sit on top of the
 * photograph — you are still in the room, reading a page of it. The right half
 * is a solid panel carrying the text, so the prose never has to fight an image
 * for contrast.
 *
 * On a narrow screen the split collapses and the whole thing becomes one
 * scrolling column, with the panel taking over as the scroll container.
 *
 * Motion is authored, not sprinkled:
 *   - open: the panel arrives from the edge it is anchored to, the title is
 *     wiped up from its own baseline, the chapter rule draws out, the body
 *     staggers at 50ms.
 *   - close: the same path reversed at roughly half the time.
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

  // Play the exit before unmounting. Guarded, because Escape, the back control
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
        <aside
          className="chapter"
          onPointerDown={(e) => e.target === e.currentTarget && requestClose()}
        >
          <p className="chapter-mark">
            <span className="chapter-no">{String(index).padStart(2, '0')}</span>
            <span className="chapter-rule" aria-hidden="true" />
            <span className="chapter-eyebrow">{eyebrow}</span>
          </p>

          <h1 className="section-title" tabIndex={-1} ref={headingRef}>
            <span className="title-ink">{title}</span>
          </h1>

          <button type="button" className="back-btn" onClick={requestClose}>
            <span className="back-arrow" aria-hidden="true">
              ←
            </span>
            <span className="back-text">Back to the room</span>
          </button>
        </aside>

        <div className="section-scroll">{children}</div>
      </div>
    </div>
  );
}
