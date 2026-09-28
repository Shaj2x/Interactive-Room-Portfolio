import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, MathUtils, Object3D, type Mesh, type MeshBasicMaterial, type PointLight, type SpotLight } from 'three';
import { useRoom } from './context';
import { COLOR } from './views';

/** Eases the shared warm level toward the lamp state. ~300ms either way. */
export function WarmDriver() {
  const { lampOn, warm, reduced } = useRoom();
  useFrame((_, dt) => {
    const goal = lampOn ? 1 : 0;
    warm.current = reduced ? goal : MathUtils.damp(warm.current, goal, 10, dt);
  });
  return null;
}

/** Cold fill: the night through the window and a little bounce off the floor. */
export function Ambient() {
  return (
    <>
      <hemisphereLight args={['#2c3f5c', '#0a0806', 0.9]} />
      <directionalLight position={[-7, 3.5, -1]} intensity={0.9} color="#6d8fb8" />
      {/* Moonlight bounced off the ceiling, so the far corner is not a void. */}
      <pointLight position={[1.8, 2.6, -1.6]} intensity={2.2} color="#7f9cc4" distance={4.5} decay={2} />
    </>
  );
}

/**
 * The key light is the laptop, as in the 2D room: cool, close, the brightest
 * thing in frame. It stays on when the lamp goes out.
 */
export function ScreenLight() {
  return <pointLight position={[0, 1.0, -2.1]} color={COLOR.screen} intensity={3.5} distance={4} decay={2} />;
}

/**
 * The desk lamp — the easter egg. Clicking it turns it off, and every warm
 * light in the room (candles, the strip under the door) goes out with it.
 * It is deliberately not a hotspot: no glow, no label, just a pointer cursor.
 */
export function Lamp() {
  const { toggleLamp, warm, canHover, lite } = useRoom();
  const spot = useRef<SpotLight>(null!);
  const bulb = useRef<MeshBasicMaterial>(null!);
  const target = useMemo(() => new Object3D(), []);

  useFrame(() => {
    spot.current.intensity = 5 * warm.current;
    bulb.current.color.set(COLOR.amber).multiplyScalar(0.15 + 2.2 * warm.current);
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        toggleLamp();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (canHover) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <mesh position={[-0.85, 0.77, -2.7]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 0.02, 24]} />
        <meshStandardMaterial color="#1c1c20" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.85, 1.04, -2.7]}>
        <cylinderGeometry args={[0.008, 0.008, 0.54, 8]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-0.785, 1.31, -2.65]} rotation={[0.6, 0, -1.2]}>
        <cylinderGeometry args={[0.007, 0.007, 0.16, 8]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-0.72, 1.28, -2.6]}>
        <coneGeometry args={[0.1, 0.12, 24, 1, true]} />
        <meshStandardMaterial color="#3a2e24" metalness={0.3} roughness={0.6} side={DoubleSide} />
      </mesh>
      <mesh position={[-0.72, 1.235, -2.6]}>
        <sphereGeometry args={[0.025, 16, 12]} />
        <meshBasicMaterial ref={bulb} toneMapped={false} />
      </mesh>
      <primitive object={target} position={[-0.35, 0.76, -2.35]} />
      <spotLight
        ref={spot}
        position={[-0.72, 1.24, -2.6]}
        target={target}
        color={COLOR.amber}
        angle={0.75}
        penumbra={0.7}
        distance={4}
        decay={2}
        castShadow={!lite}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
    </group>
  );
}

/**
 * A candle. Brightness comes from three incommensurate sines (so no two candles
 * ever beat together) plus rare random gusts that dip the flame and recover.
 * All of it mutates the light and mesh directly — no React state per frame.
 */
export function Candle({ position, height, seed }: { position: [number, number, number]; height: number; seed: number }) {
  const { warm, reduced } = useRoom();
  const light = useRef<PointLight>(null!);
  const flame = useRef<Mesh>(null!);
  const gust = useRef(0);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    let n = 0;
    if (!reduced) {
      n = 0.5 * Math.sin(t * 7.3 + seed) + 0.3 * Math.sin(t * 13.1 + seed * 2.1) + 0.2 * Math.sin(t * 23.7 + seed * 3.7);
      if (Math.random() < dt * 0.35) gust.current = 0.35 + Math.random() * 0.3;
      gust.current = MathUtils.damp(gust.current, 0, 3, dt);
    }
    const w = warm.current;
    light.current.intensity = 0.35 * w * (0.88 + 0.12 * n - gust.current);
    flame.current.scale.set(1 - 0.08 * n, (1 + 0.15 * n - gust.current * 0.5) * Math.max(w, 0.001), 1);
    flame.current.visible = w > 0.02;
  });

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.024, height, 20]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.7} />
      </mesh>
      <mesh ref={flame} position={[0, height + 0.018, 0]}>
        <sphereGeometry args={[0.009, 12, 10]} />
        <meshBasicMaterial color={[2.4, 1.3, 0.45]} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, height + 0.05, 0]} color={COLOR.flame} distance={2.4} decay={2} />
    </group>
  );
}

/** The warm strip under the door. Fades with the lamp. */
export function DoorStrip() {
  const { warm } = useRoom();
  const mat = useRef<MeshBasicMaterial>(null!);
  const light = useRef<PointLight>(null!);
  useFrame(() => {
    mat.current.color.set(COLOR.amber).multiplyScalar(1.6 * warm.current);
    light.current.intensity = 0.25 * warm.current;
  });
  return (
    <>
      <mesh position={[3.975, 0.008, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.014]} />
        <meshBasicMaterial ref={mat} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[3.8, 0.05, 0.4]} color={COLOR.amber} distance={1.4} decay={2} />
    </>
  );
}
