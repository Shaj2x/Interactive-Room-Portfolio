import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { HOTSPOT_BY_ID, HOTSPOTS } from '../scene/hotspots';
import { identity, type SectionId } from '../content/profile';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { RoomContext, type RoomState } from './context';
import { Scene } from './Scene';
import { HOME } from './views';
import './room3d.css';

function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return match;
}

/** A click with detail 0 came from Enter/Space, not a pointer. */
const fromKeyboard = (e: MouseEvent) => e.detail === 0;

export default function Room3D() {
  const reduced = useReducedMotion();
  // Touch fires pointerover on tap; a glow that appears only as you open
  // something is noise, so hover is only honoured on a real hovering pointer.
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  const [selected, setSelected] = useState<SectionId | null>(null);
  const [hovered, setHovered] = useState<SectionId | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [lite, setLite] = useState(false);
  const warm = useRef(1);
  const instantCut = useRef(false);

  const select = useCallback<RoomState['select']>((id, opts) => {
    instantCut.current = Boolean(opts?.instant);
    setSelected(id);
    setHovered(null);
  }, []);

  const hover = useCallback((id: SectionId) => canHover && setHovered(id), [canHover]);
  const unhover = useCallback((id: SectionId) => setHovered((h) => (h === id ? null : h)), []);
  const toggleLamp = useCallback(() => setLampOn((on) => !on), []);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
  }, [hovered]);

  // Escape is keyboard-initiated, so the camera cuts home rather than flying.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null, { instant: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select]);

  const state = useMemo<RoomState>(
    () => ({ selected, hovered, select, hover, unhover, lampOn, toggleLamp, reduced, canHover, lite, setLite, warm, instantCut }),
    [selected, hovered, select, hover, unhover, lampOn, toggleLamp, reduced, canHover, lite],
  );

  const nav = [...HOTSPOTS].sort((a, b) => a.order - b.order);
  const card = selected ? HOTSPOT_BY_ID[selected] : null;
  // Keep the last card's content mounted while it fades out.
  const lastCard = useRef(card);
  if (card) lastCard.current = card;
  const shown = card ?? lastCard.current;

  return (
    <RoomContext.Provider value={state}>
      <main className="r3f">
        <Canvas
          className="r3f-canvas"
          shadows
          dpr={[1, 1.75]}
          frameloop={reduced ? 'demand' : 'always'}
          camera={{ fov: 50, near: 0.05, far: 30, position: HOME.position }}
          gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
          onPointerMissed={() => select(null)}
          aria-label="A dim bedroom at night, in 3D. Objects in it open sections of the portfolio; the list of sections is below."
          role="img"
        >
          <Scene />
        </Canvas>

        <header className="r3f-sig">
          <span className="r3f-name">{identity.name}</span>
          <span className="r3f-sub">the room, in three dimensions</span>
        </header>

        <p className="r3f-label" data-on={Boolean(hovered && !selected)} aria-hidden>
          {hovered ? HOTSPOT_BY_ID[hovered].label : ''}
        </p>

        <nav className="r3f-nav" aria-label="Sections">
          <ul>
            {nav.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  aria-pressed={selected === h.id}
                  onClick={(e) => select(h.id, { instant: fromKeyboard(e) })}
                  onPointerEnter={() => hover(h.id)}
                  onPointerLeave={() => unhover(h.id)}
                >
                  {h.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <aside className="r3f-card" data-open={Boolean(card)} aria-hidden={!card} aria-live="polite">
          {shown && (
            <>
              <h2>{shown.label}</h2>
              <p>{shown.description}</p>
              <div className="r3f-card-actions">
                <a href={`${import.meta.env.BASE_URL}#${shown.id}`} tabIndex={card ? 0 : -1}>
                  Open this section
                </a>
                <button type="button" tabIndex={card ? 0 : -1} onClick={(e) => select(null, { instant: fromKeyboard(e) })}>
                  Back to the room <kbd>Esc</kbd>
                </button>
              </div>
            </>
          )}
        </aside>

        <footer className="r3f-foot">
          React Three Fiber · procedural, no models ·{' '}
          <a href={import.meta.env.BASE_URL}>the 2D room</a>
          {!lampOn && <span> · the lamp is off</span>}
        </footer>
      </main>
    </RoomContext.Provider>
  );
}
