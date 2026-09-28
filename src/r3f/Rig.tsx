import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, type PerspectiveCamera } from 'three';
import { useRoom } from './context';
import { Spring3 } from './spring';
import { HOME, VIEWS } from './views';

/**
 * Flies the camera between views on a critically damped spring, and at home
 * sways it slightly with the pointer (parallax) — the same two motions as the
 * 2D room, but with real perspective instead of layered offsets.
 */
export function CameraRig() {
  const { selected, reduced, instantCut } = useRoom();
  const pos = useMemo(() => new Spring3(HOME.position), []);
  const look = useMemo(() => new Spring3(HOME.target), []);

  useFrame((state, dt) => {
    const view = selected ? VIEWS[selected] : HOME;
    pos.target.set(...view.position);
    look.target.set(...view.target);
    if (!selected && !reduced) {
      pos.target.x += state.pointer.x * 0.3;
      pos.target.y += state.pointer.y * 0.12;
    }
    // Keyboard navigation and reduced motion cut; pointer navigation flies.
    if (reduced || instantCut.current) {
      pos.snap();
      look.snap();
      instantCut.current = false;
    } else {
      pos.step(dt, 7.5);
      look.step(dt, 7.5);
    }
    state.camera.position.copy(pos.value);
    state.camera.lookAt(look.value);
  });

  // Views are framed for landscape. On a portrait phone, widen the lens so
  // they keep ~64° of horizontal view instead of cropping to a sliver.
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / s.size.height);
  useEffect(() => {
    const keepH = 2 * Math.atan(Math.tan(MathUtils.degToRad(32)) / aspect);
    camera.fov = Math.min(Math.max(50, MathUtils.radToDeg(keepH)), 88);
    camera.updateProjectionMatrix();
  }, [camera, aspect]);

  return null;
}

/**
 * Reduced motion switches the canvas to frameloop="demand": nothing ambient
 * moves, so frames render only when something changes. This pokes it on the
 * changes that happen through React state.
 */
export function Invalidator() {
  const { selected, hovered, lampOn, lite } = useRoom();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [invalidate, selected, hovered, lampOn, lite]);
  return null;
}

/**
 * Measures real frame times once, after the scene settles, and sheds the
 * expensive extras (retina resolution, shadows, dust) below 38fps. Device
 * size says nothing about GPU power, so this measures instead of guessing.
 */
export function QualityGuard() {
  const { setLite, reduced } = useRoom();
  const setDpr = useThree((s) => s.setDpr);
  const sample = useRef({ t: 0, frames: 0, done: false });

  useFrame((_, dt) => {
    const s = sample.current;
    if (s.done || reduced) return;
    s.t += dt;
    if (s.t < 1.5) return;
    s.frames++;
    if (s.t >= 3.5) {
      s.done = true;
      if (s.frames / (s.t - 1.5) < 38) {
        setDpr(1);
        setLite(true);
      }
    }
  });

  return null;
}
