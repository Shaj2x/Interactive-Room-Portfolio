import { useEffect, useRef } from 'react';
import { HOTSPOTS } from './hotspots';
import { originOf, type OpenOrigin } from './openOrigin';
import type { SectionId } from '../content/profile';

const VB_W = 1600;
const VB_H = 900;

/**
 * How a name sits against the point it is pinned to.
 *
 * A name centred on its object runs off the frame when the object is near an
 * edge — and the room is cover-fitted, so at anything but 16:9 the sides are
 * cropped and "near an edge" happens sooner than the scene coordinates
 * suggest. Measured at 1440x900, Leadership started at -4px and Résumé ended
 * 45px past the right side.
 *
 * So the outer thirds anchor inward instead: a name on the left starts at its
 * object and runs right, a name on the right ends at its object and runs
 * left, and the leader line always points back at the thing it names.
 */
function anchorOf(fx: number): 'start' | 'middle' | 'end' {
  if (fx < 0.24) return 'start';
  if (fx > 0.62) return 'end';
  return 'middle';
}

interface Props {
  open: boolean;
  onOpen: (id: SectionId, origin: OpenOrigin | null) => void;
  onDismiss: () => void;
  /** The section currently showing, so its own pin reads as current. */
  current: SectionId | null;
}

/**
 * The room's menu. Not a dropdown — the eight names hang on the objects they
 * belong to, each on a short leader line, and the room dims behind them.
 *
 * Navigation stops being a layer laid over the photograph and becomes part of
 * it. That only works because every object's box is already known in scene
 * coordinates, so a name can be placed on its own object at any viewport size
 * without measuring anything — the pin repeats in calc() the same cover fit
 * `.stage` performs on itself, and clamps the result into the viewport.
 *
 * Names near an edge anchor inward so nothing runs off the frame. There is no
 * panel to escape from, so Escape and a click on bare room both dismiss.
 */
export function PinnedMenu({ open, onOpen, onDismiss, current }: Props) {
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    first.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onDismiss]);

  const pins = [...HOTSPOTS].sort((a, b) => a.order - b.order);

  return (
    <nav
      className={`pinned-menu${open ? ' is-open' : ''}`}
      aria-label="Sections"
      aria-hidden={!open}
      onPointerDown={(e) => e.target === e.currentTarget && onDismiss()}
    >
      {pins.map((spot, i) => {
        const fx = (spot.x + spot.w / 2) / VB_W;
        const fy = (spot.y + spot.h / 2) / VB_H;
        const anchor = anchorOf(fx);

        return (
          <button
            key={spot.id}
            ref={i === 0 ? first : undefined}
            type="button"
            className="pin"
            data-anchor={anchor}
            style={{
              // The room is `cover`-fitted, so a pin's place on screen is the
              // same sum the stage uses to fit itself. Done in calc() rather
              // than measured, so it survives a resize with no listener.
              ['--fx' as string]: fx,
              ['--fy' as string]: fy,
              // Each pin and its leader arrive together, in the room's own
              // reading order rather than all at once.
              ['--pin-delay' as string]: `${90 + i * 45}ms`,
            }}
            tabIndex={open ? 0 : -1}
            aria-current={current === spot.id ? 'page' : undefined}
            aria-label={spot.description}
            onClick={(e) => onOpen(spot.id, originOf(e.currentTarget))}
          >
            <span className="pin-lead" aria-hidden="true" />
            <span className="pin-no" aria-hidden="true">
              {String(spot.order).padStart(2, '0')}
            </span>
            <span className="pin-name">{spot.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
