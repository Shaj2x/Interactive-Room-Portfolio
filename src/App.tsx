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

const BASE_TITLE = `${identity.name} — ${identity.positioning}`;

export default function App() {
  const [route, navigate] = useHashRoute();
  const [introDone, setIntroDone] = useState(false);
  /** The teaching state. Flips false on the first interaction and never returns. */
  const [needsHint, setNeedsHint] = useState(true);

  const reducedMotion = useReducedMotion();
  const compact = useIsCompact();
  const roomTone = useRoomTone();

  // Deep links skip the intro: arriving at #projects should land on projects.
  const [skipIntro] = useState(() => route !== null);

  const open = useCallback(
    (id: SectionId) => {
      setNeedsHint(false);
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
        showHint={roomReady && needsHint && route === null}
      />

      {roomReady && (
        <>
          <Signature />
          <NavMenu onOpen={open} current={route} />
          <SoundToggle enabled={roomTone.enabled} onToggle={roomTone.toggle} />
          {compact ? (
            <CompactNav onOpen={open} current={route} />
          ) : (
            <LookAround visible={needsHint && route === null} />
          )}
        </>
      )}

      {route && <Section key={route} id={route} onClose={close} />}

      {showIntro && (
        <Intro onDone={() => setIntroDone(true)} reducedMotion={reducedMotion} />
      )}
    </>
  );
}
