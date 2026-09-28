import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useFrame, type GroupProps } from '@react-three/fiber';
import { Color, MathUtils, type Group, type Mesh, type MeshStandardMaterial } from 'three';
import { useRoom } from './context';
import { COLOR } from './views';
import type { SectionId } from '../content/profile';

const ACCENT = new Color(COLOR.accent);

/**
 * Makes everything inside it one clickable object. Hover lights a cyan rim on
 * every standard material in the subtree — the accent is interactive-only, the
 * same rule as the 2D room. The glow is written straight onto the materials in
 * useFrame, so hovering never re-renders the scene graph.
 */
export function Interactive({ section: id, children, ...props }: { section: SectionId; children: ReactNode } & Omit<GroupProps, 'id'>) {
  const { hovered, hover, unhover, select, reduced } = useRoom();
  const group = useRef<Group>(null!);
  const materials = useRef<MeshStandardMaterial[]>([]);
  const level = useRef(0);

  useLayoutEffect(() => {
    const found = new Set<MeshStandardMaterial>();
    group.current.traverse((o) => {
      const m = (o as Mesh).material as MeshStandardMaterial | undefined;
      if ((o as Mesh).isMesh && m?.isMeshStandardMaterial) found.add(m);
    });
    materials.current = [...found];
  }, [children]);

  useFrame((_, dt) => {
    const goal = hovered === id ? 1 : 0;
    if (level.current === goal) return;
    // Lambda 16 ≈ 180ms to settle: the --d-hover duration, frame-rate independent.
    level.current = reduced ? goal : MathUtils.damp(level.current, goal, 16, dt);
    if (Math.abs(level.current - goal) < 0.003) level.current = goal;
    for (const m of materials.current) {
      m.emissive.copy(ACCENT);
      m.emissiveIntensity = level.current * 0.35;
    }
  });

  return (
    <group
      ref={group}
      {...props}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover(id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        unhover(id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        select(id);
      }}
    >
      {children}
    </group>
  );
}

/**
 * An invisible, generous hit box for objects too small to find with a cursor.
 * Basic material, so the hover glow skips it.
 */
export function HitProxy({ size, position }: { size: [number, number, number]; position?: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
