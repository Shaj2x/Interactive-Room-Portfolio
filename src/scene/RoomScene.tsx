import { useEffect, useRef, useState } from 'react';
import { SceneDefs } from './SceneDefs';
import { WallLayer } from './layers/WallLayer';
import { FurnitureLayer } from './layers/FurnitureLayer';
import { DesktopLayer } from './layers/DesktopLayer';
import { PersonLayer } from './layers/PersonLayer';
import { ForegroundLayer } from './layers/ForegroundLayer';
import { PlateLayer } from './layers/PlateLayer';
import { PlateFlickers } from './PlateFlickers';
import { CandleLayer } from './layers/CandleLayer';
import { plateSrc } from './plate';
import { plateVeil } from './plateVeil';
import { Atmosphere } from './Atmosphere';
import { WallTexture } from './WallTexture';
import { Hotspot } from './Hotspot';
import { HOTSPOTS, DEPTH, isTappableWhenCompact } from './hotspots';
import { useParallax } from '../hooks/useParallax';
import { useWarmFlicker } from '../hooks/useWarmFlicker';
import { useQualityGuard } from '../hooks/useQualityGuard';
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
  /**
   * True once the baked veil has finished fading over the room, at which point
   * the live scene underneath is invisible and can stop being rendered at all.
   *
   * It lags `dimmed` on the way in (so the cross-fade is seen) and leads it on
   * the way out (so the room is back before it is uncovered).
   */
  const [veiled, setVeiled] = useState(false);

  useEffect(() => {
    if (!dimmed) {
      setVeiled(false);
      return;
    }
    if (reducedMotion) {
      setVeiled(true);
      return;
    }
    // 620ms is --d-camera, the length of the veil's fade.
    const t = window.setTimeout(() => setVeiled(true), 640);
    return () => window.clearTimeout(t);
  }, [dimmed, reducedMotion]);

  useParallax(stageRef, {
    disabled: reducedMotion || dimmed,
    strength: compact ? 0.45 : 1,
  });

  // Every warm light in the room flickers together, irregularly. Off with the
  // lamp easter egg, off for reduced motion, and off behind an open section:
  // each step rewrites opacity on the warm lights, and behind the blur that
  // means recomputing a viewport-sized filter eight times a second for motion
  // nobody can see.
  useWarmFlicker(stageRef, { disabled: reducedMotion || !lampOn || dimmed });

  // Measured, not guessed: screen size says nothing about rendering power.
  const lite = useQualityGuard({ enabled: !reducedMotion && !compact });

  // The laptop cycles a line of its own text. Slow on purpose: it should be
  // something you notice on the second look, not a ticker.
  useEffect(() => {
    // Paused behind an open section for the same reason as the flicker: the
    // line is unreadable through the blur, and changing it repaints the room.
    if (reducedMotion || dimmed) return;
    const t = window.setInterval(
      () => setScreenLine((i) => (i + 1) % screenLines.length),
      7400,
    );
    return () => window.clearInterval(t);
  }, [reducedMotion, dimmed]);

  return (
    <div
      className={[
        'room',
        dimmed ? 'is-dimmed' : '',
        veiled ? 'is-veiled' : '',
        lampOn ? '' : 'is-lampless',
        lite ? 'is-lite' : '',
        reducedMotion ? 'is-still' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* The baked stand-in for the room, shown while a section is open. See
          plateVeil.ts for why this is an image and not a blur filter. */}
      <div
        className="room-veil"
        aria-hidden="true"
        style={plateSrc ? { backgroundImage: `url(${plateVeil})` } : undefined}
      />

      <div className="stage" ref={stageRef}>
        {/* Static plaster grain, composited under the scene. */}
        {!plateSrc && <WallTexture />}


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
              {/* Candles sit with the furniture, behind the desk objects. */}
              {lampOn && (
                <g data-depth={DEPTH.furniture}>
                  <CandleLayer />
                </g>
              )}
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

        {/* Lights that flicker: over the scene, not inside it. Inside, every
            frame of the animation repaints the filtered SVG; out here each one
            is a compositor layer animating only opacity. */}
        <PlateFlickers lampOn={lampOn} />

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
