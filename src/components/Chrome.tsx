import { useEffect, useRef, useState } from 'react';
import { HOTSPOTS } from '../scene/hotspots';
import { identity, type SectionId } from '../content/profile';
import './chrome.css';

interface NavProps {
  onOpen: (id: SectionId) => void;
  current: SectionId | null;
}

/**
 * The plain navigation. The room is the interesting way to get around; this is
 * the way that always works — for screen readers, for keyboards, for anyone who
 * would rather not hunt for a mug. Same sections, same order, no hunting.
 */
export function NavMenu({ onOpen, current }: NavProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [open]);

  return (
    <div className="nav" ref={panelRef}>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-list"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav-bars" aria-hidden="true">
          <i />
          <i />
        </span>
        Menu
      </button>

      <nav id="nav-list" className={`nav-list${open ? ' is-open' : ''}`} aria-label="Sections">
        <ul>
          {[...HOTSPOTS]
            .sort((a, b) => a.order - b.order)
            .map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  aria-current={current === h.id ? 'page' : undefined}
                  onClick={() => {
                    onOpen(h.id);
                    setOpen(false);
                  }}
                >
                  {h.label}
                </button>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * The portrait-screen section list. The room stays interactive for the objects
 * big enough to tap; everything else lives here, in the open, rather than as a
 * 20px target someone has to hunt for.
 */
export function CompactNav({ onOpen, current }: NavProps) {
  return (
    <div className="compact-nav">
      <nav aria-label="Sections">
        <ul>
          {[...HOTSPOTS]
            .sort((a, b) => a.order - b.order)
            .map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  aria-current={current === h.id ? 'page' : undefined}
                  onClick={() => onOpen(h.id)}
                >
                  {h.label}
                </button>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}

/** Room tone control. Off by default, and obvious — both required by the brief. */
export function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`sound${enabled ? ' is-on' : ''}`}
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute room tone' : 'Play room tone (rain and hum)'}
      title={enabled ? 'Mute room tone' : 'Play room tone'}
    >
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="sound-text">{enabled ? 'Room tone on' : 'Room tone'}</span>
    </button>
  );
}

/**
 * Corner signature. Quiet, and the only chrome the room carries at rest — it
 * steps aside when a section sheet slides over the top of it rather than
 * running underneath and being sliced in half.
 */
export function Signature({ away }: { away: boolean }) {
  return (
    <div className={`signature${away ? ' is-away' : ''}`} aria-hidden={away}>
      <p className="sig-name">{identity.name}</p>
      <p className="sig-line">{identity.positioning}</p>
    </div>
  );
}

/** One line, once, on first load. Gone after the first interaction, for good. */
export function LookAround({ visible }: { visible: boolean }) {
  return (
    <p className={`look-around${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      Look around. Some of this is clickable.
    </p>
  );
}
