import { useCallback, useEffect, useState } from 'react';
import { RoomScene } from './scene/RoomScene';
import { Section } from './sections/Sections';
import { Intro } from './components/Intro';
import { CompactNav, LookAround, NavMenu, Signature, SoundToggle } from './components/Chrome';
import { useHashRoute } from './hooks/useHashRoute';
import { useIsCompact, useReducedMotion } from './hooks/useReducedMotion';
import { useRoomTone } from './hooks/useRoomTone';
import { HOTSPOT_BY_ID } from './scene/hotspots';
import { identity, type SectionId } from './content/profile';
import type { OpenOrigin } from './scene/openOrigin';

const BASE_TITLE = `${identity.name} — ${identity.positioning}`;

export default function App() {
  const [route, navigate] = useHashRoute();
  const [introDone, setIntroDone] = useState(false);
  /** The teaching state. Flips false on the first interaction and never returns. */
  const [needsHint, setNeedsHint] = useState(true);
  /** The room's menu. It has no panel, so its state lives with the room. */
  const [menuOpen, setMenuOpen] = useState(false);

  const reducedMotion = useReducedMotion();
  const compact = useIsCompact();
  const roomTone = useRoomTone();

  // Deep links skip the intro: arriving at #projects should land on projects.
  const [skipIntro] = useState(() => route !== null);

  /**
   * Where the open came from, so the sheet can grow out of it. Cleared on
   * close, and never set for a deep link or a browser Back — in those cases
   * there genuinely was no object, and the sheet says so by arriving from the
   * middle of the screen instead.
   */
  const [origin, setOrigin] = useState<OpenOrigin | null>(null);

  const open = useCallback(
    (id: SectionId, from: OpenOrigin | null = null) => {
      setNeedsHint(false);
      setOrigin(from);
      setMenuOpen(false);
      navigate(id);
    },
    [navigate],
  );

  const close = useCallback(() => navigate(null), [navigate]);

  // Title tracks the route so a shared or bookmarked section reads correctly.
  useEffect(() => {
    document.title = route ? `${HOTSPOT_BY_ID[route].label} — ${identity.name}` : BASE_TITLE;
  }, [route]);

  // Any first interaction retires the hint, whether or not it was a hotspot.
  useEffect(() => {
    if (!needsHint) return;
    const retire = () => setNeedsHint(false);
    const t = window.setTimeout(retire, 14000);
    window.addEventListener('pointerdown', retire, { once: true });
    window.addEventListener('keydown', retire, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('pointerdown', retire);
      window.removeEventListener('keydown', retire);
    };
  }, [needsHint]);

  const showIntro = !introDone && !skipIntro;
  const roomReady = introDone || skipIntro;

  return (
    <>
      <a className="skip-link" href="#nav-list">
        Skip to the section menu
      </a>

      <RoomScene
        onOpen={open}
        dimmed={route !== null}
        reducedMotion={reducedMotion}
        compact={compact}
        showHint={roomReady && needsHint && route === null && !menuOpen}
        menuOpen={menuOpen && route === null}
        onDismissMenu={() => setMenuOpen(false)}
        current={route}
      />

      {roomReady && (
        <>
          <Signature away={route !== null} />
          <NavMenu
            open={menuOpen}
            onToggle={() => setMenuOpen((v) => !v)}
            hidden={compact || route !== null}
          />
          <SoundToggle
            enabled={roomTone.enabled}
            onToggle={roomTone.toggle}
            tucked={route !== null}
          />
          {compact ? (
            <CompactNav onOpen={open} current={route} />
          ) : (
            <LookAround visible={needsHint && route === null} />
          )}
        </>
      )}

      {route && <Section key={route} id={route} origin={origin} onClose={close} />}

      {showIntro && (
        <Intro onDone={() => setIntroDone(true)} reducedMotion={reducedMotion} />
      )}
    </>
  );
}
