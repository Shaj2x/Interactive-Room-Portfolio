import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, type InstancedMesh } from 'three';
import { useRoom } from './context';
import { canvasTexture, drawCity, seeded } from './textures';

const DROPS = 280;
const dummy = new Object3D();

/**
 * Rain outside the window: 280 streaks in ONE InstancedMesh — one draw call,
 * not 280. Only their matrices change per frame; the geometry never does.
 */
function Rain() {
  const { reduced } = useRoom();
  const mesh = useRef<InstancedMesh>(null!);
  const drops = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: DROPS }, () => ({
      x: -6.6 + rand() * 2.3,
      y: 0.4 + rand() * 3.4,
      z: -2.6 + rand() * 3.2,
      speed: 5 + rand() * 3,
    }));
  }, []);

  const write = () => {
    drops.forEach((d, i) => {
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0.12, 0, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(write, [drops]);

  useFrame((_, dt) => {
    if (reduced) return; // Reduced motion: the rain is there, it just holds still.
    const h = Math.min(dt, 1 / 30);
    for (const d of drops) {
      d.y -= d.speed * h;
      d.z -= d.speed * h * 0.12;
      if (d.y < 0.4) {
        d.y += 3.4;
        d.z += 0.4;
      }
    }
    write();
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, DROPS]} frustumCulled={false}>
      <boxGeometry args={[0.004, 0.14, 0.004]} />
      <meshBasicMaterial color="#9fc3e6" transparent opacity={0.35} depthWrite={false} />
    </instancedMesh>
  );
}

/** The window: a city backdrop, the rain in front of it, then frame and glass. */
export function Weather() {
  const city = useMemo(() => canvasTexture(1024, 512, drawCity), []);
  const frame = '#141a24';
  return (
    <group>
      <mesh position={[-7.2, 1.8, -1.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[9, 4.5]} />
        <meshBasicMaterial map={city} toneMapped={false} fog={false} />
      </mesh>
      <Rain />
      {/* Frame: sill, head, jambs and a mullion. */}
      <mesh position={[-3.92, 1.13, -1.1]}>
        <boxGeometry args={[0.2, 0.04, 1.62]} />
        <meshStandardMaterial color={frame} roughness={0.8} />
      </mesh>
      <mesh position={[-3.97, 2.37, -1.1]}>
        <boxGeometry args={[0.08, 0.05, 1.6]} />
        <meshStandardMaterial color={frame} roughness={0.8} />
      </mesh>
      {[-1.86, -0.34].map((z) => (
        <mesh key={z} position={[-3.97, 1.75, z]}>
          <boxGeometry args={[0.08, 1.26, 0.04]} />
          <meshStandardMaterial color={frame} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-3.98, 1.75, -1.1]}>
        <boxGeometry args={[0.04, 1.2, 0.03]} />
        <meshStandardMaterial color={frame} roughness={0.8} />
      </mesh>
      <mesh position={[-3.99, 1.75, -1.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 1.2]} />
        <meshStandardMaterial color="#9fc3e6" transparent opacity={0.08} roughness={0.05} depthWrite={false} />
      </mesh>
    </group>
  );
}
