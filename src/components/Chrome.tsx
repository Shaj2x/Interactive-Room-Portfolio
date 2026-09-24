import { HOTSPOTS } from '../scene/hotspots';
import { identity, type SectionId } from '../content/profile';
import { originOf, type OpenOrigin } from '../scene/openOrigin';
import './chrome.css';

interface NavProps {
  onOpen: (id: SectionId, origin: OpenOrigin | null) => void;
  current: SectionId | null;
}

/**
 * The trigger, and nothing else. There is no dropdown any more: the room's
 * menu hangs its names on the objects they belong to — see <PinnedMenu> — so
 * this button only says whether those names are up.
 *
 * It is hidden on a narrow screen, where the room is too small to read eight
 * names off and <CompactNav> already lists every section in the open.
 */
export function NavMenu({
  open,
  onToggle,
  hidden,
}: {
  open: boolean;
  onToggle: () => void;
  hidden: boolean;
}) {
  if (hidden) return null;

  return (
    <div className="nav">
      <button
        type="button"
        className={`nav-toggle${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls="nav-list"
        onClick={onToggle}
      >
        <span className="nav-bars" aria-hidden="true">
          <i />
          <i />
        </span>
        {open ? 'Close' : 'Menu'}
      </button>
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
                  onClick={(e) => onOpen(h.id, originOf(e.currentTarget))}
                >
                  <span className="nav-no" aria-hidden="true">
                    {String(h.order).padStart(2, '0')}
                  </span>
                  <span className="nav-label">{h.label}</span>
                </button>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}

/** Room tone control. Off by default, and obvious — both required by the brief. */
export function SoundToggle({
  enabled,
  onToggle,
  tucked,
}: {
  enabled: boolean;
  onToggle: () => void;
  /** A section is open: the control sits under the menu instead of in the
      bottom-left corner, where the chapter's way-back control now lives. */
  tucked: boolean;
}) {
  return (
    <button
      type="button"
      className={`sound${enabled ? ' is-on' : ''}${tucked ? ' is-tucked' : ''}`}
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
