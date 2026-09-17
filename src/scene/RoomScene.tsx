import { useEffect, useRef, useState } from 'react';
import { SceneDefs } from './SceneDefs';
import { WallLayer } from './layers/WallLayer';
import { FurnitureLayer } from './layers/FurnitureLayer';
import { DesktopLayer } from './layers/DesktopLayer';
import { PersonLayer } from './layers/PersonLayer';
import { ForegroundLayer } from './layers/ForegroundLayer';
import { PlateLayer } from './layers/PlateLayer';
import { plateSrc } from './plate';
import { Atmosphere } from './Atmosphere';
import { Hotspot } from './Hotspot';
import { HOTSPOTS, DEPTH, isTappableWhenCompact } from './hotspots';
import { useParallax } from '../hooks/useParallax';
import { screenLines, type SectionId } from '../content/profile';
import './room.css';

interface Props {
  onOpen: (id: SectionId) => void;
  /** True once a section is open: the room dims and stops taking clicks. */
  dimmed: boolean;
  reducedMotion: boolean;
  compact: boolean;
  /** The first hotspot pulses once, until the visitor interacts. */
  showHint: boolean;
}

export function RoomScene({ onOpen, dimmed, reducedMotion, compact, showHint }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [screenLine, setScreenLine] = useState(0);
  const [lampOn, setLampOn] = useState(true);

  useParallax(stageRef, {
    disabled: reducedMotion || dimmed,
    strength: compact ? 0.45 : 1,
  });

  // The laptop cycles a line of its own text. Slow on purpose: it should be
  // something you notice on the second look, not a ticker.
  useEffect(() => {
    if (reducedMotion) return;
    const t = window.setInterval(
      () => setScreenLine((i) => (i + 1) % screenLines.length),
      7400,
    );
    return () => window.clearInterval(t);
  }, [reducedMotion]);

  return (
    <div
      className={[
        'room',
        dimmed ? 'is-dimmed' : '',
        lampOn ? '' : 'is-lampless',
        reducedMotion ? 'is-still' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="stage" ref={stageRef}>
        <svg
          className="scene"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <SceneDefs />

          {plateSrc ? (
            /* Painted art path: one plate on the far plane, with the light and
               weather animated over it. */
            <g data-depth={DEPTH.wall}>
              <PlateLayer lampOn={lampOn} />
            </g>
          ) : (
            <>
              <g data-depth={DEPTH.wall}>
                <WallLayer />
              </g>
              <g data-depth={DEPTH.furniture}>
                <FurnitureLayer />
              </g>
              <g data-depth={DEPTH.desktop}>
                <DesktopLayer
                  screenLine={screenLine}
                  lampOn={lampOn}
                  onToggleLamp={() => setLampOn((v) => !v)}
                />
              </g>
              <g data-depth={DEPTH.person}>
                <PersonLayer />
              </g>
            </>
          )}

          {/* Dust and the blurred near edges sit in front of either art path. */}
          <g data-depth={DEPTH.foreground}>
            <ForegroundLayer />
          </g>
        </svg>

        {/* Hotspots ride the same depth as the art they sit on, so they never
            drift away from their object as the room parallaxes. */}
        <div className="hotspot-field" aria-hidden={dimmed}>
          {HOTSPOTS.filter((s) => !compact || isTappableWhenCompact(s)).map((spot) => (
            <div key={spot.id} className="hotspot-depth" data-depth={spot.depth}>
              <Hotspot
                spot={spot}
                onOpen={onOpen}
                disabled={dimmed}
                hinting={showHint && spot.id === 'build'}
                alwaysLabel={compact}
              />
            </div>
          ))}
        </div>
      </div>

      <Atmosphere />
    </div>
  );
}
