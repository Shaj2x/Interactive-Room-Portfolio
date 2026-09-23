import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { OpenOrigin } from '../scene/openOrigin';

/** Exit is faster than entry — the user has already decided to leave. */
const EXIT_MS = 260;

interface Props {
  title: string;
  /** The object in the room you clicked to get here. */
  eyebrow: string;
  /** Position in the room's tab order. Printed as 01–08. */
  index: number;
  /** Where on screen the open came from, if it came from anywhere. */
  origin: OpenOrigin | null;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The frame every section shares: a sheet of paper pulled under the lamp.
 *
 * Warm cream, dark ink, a blank sheet sitting a degree off-square behind it,
 * and a long soft shadow onto the dark room. It grows out of whatever you
 * clicked — the bookshelf, the mug, a line in the menu — and collapses back
 * into it when you leave.
 *
 * The growing is done entirely in CSS. `--ox` / `--oy` are the press point in
 * viewport pixels; the stack is centred, so its own left edge is at
 * `(100vw - width) / 2` and the press point inside it is
 * `--ox - (100vw - 100%) / 2`. That is a legal `transform-origin`, which means
 * no layout read, no measuring pass, and no frame of the sheet in the wrong
 * place before JavaScript catches up. Without an origin it falls back to the
 * middle of the screen, which is the honest answer for a deep link.
 *
 * The frame scales; the type does not. Scaling a page of text from a third of
 * its size renders it blurred for the whole flight, so the paper travels alone
 * and the words fade in once it has landed.
 */
export function SectionShell({ title, eyebrow, index, origin, onClose, children }: Props) {
  const paperRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const [closing, setClosing] = useState(false);
  const leaving = useRef(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Play the exit before unmounting. Guarded, because Escape, the back control
  // and a click on the room can all arrive inside the same 260ms.
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
      const focusables = paperRef.current?.querySelectorAll<HTMLElement>(
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

  const originVars = origin
    ? ({ '--ox': `${origin.x}px`, '--oy': `${origin.y}px` } as CSSProperties)
    : undefined;

  return (
    <div
      className="section-backdrop"
      data-state={closing ? 'closing' : 'open'}
      onPointerDown={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div className="paper-stack" style={originVars}>
        {/* The sheet underneath. Blank, a degree off-square, and the reason the
            page reads as a physical thing rather than a rectangle of UI. The
            page itself stays square: half a degree of rotation on a column of
            body text costs you crisp glyph rasterisation. */}
        <div className="paper-under" aria-hidden="true" />

        <div
          className="paper"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          ref={paperRef}
        >
          {/* Back first, on the left, at every width. It is where a way out is
              looked for, it puts the control first in the tab order, and it
              keeps the top-right corner clear for the room's own menu button —
              which the two of them were fighting over on a phone. */}
          <header className="paper-head">
            <button type="button" className="back-btn" onClick={requestClose}>
              <span className="back-arrow" aria-hidden="true">
                ←
              </span>
              <span className="back-text">Back to the room</span>
            </button>

            <p className="chapter-mark">
              <span className="chapter-no">{String(index).padStart(2, '0')}</span>
              <span className="chapter-rule" aria-hidden="true" />
              <span className="chapter-eyebrow">{eyebrow}</span>
            </p>
          </header>

          <div className="section-scroll">
            <h1 className="section-title" tabIndex={-1} ref={headingRef}>
              <span className="title-ink">{title}</span>
            </h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
