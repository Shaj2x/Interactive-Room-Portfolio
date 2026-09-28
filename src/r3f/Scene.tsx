import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Color, Object3D, type InstancedMesh } from 'three';
import { screenLines } from '../content/profile';
import { useRoom } from './context';
import { HitProxy, Interactive } from './Interactive';
import { Ambient, Candle, DoorStrip, Lamp, ScreenLight, WarmDriver } from './Lights';
import { Weather } from './Weather';
import { Dust } from './Dust';
import { CameraRig, Invalidator, QualityGuard } from './Rig';
import { canvasTexture, drawCork, drawPoster, seeded } from './textures';
import { COLOR } from './views';

const H = 3.2; // ceiling height

/** Floor, ceiling and walls. The left wall is four panels around the window. */
function Shell() {
  const wall = <meshStandardMaterial color={COLOR.wall} roughness={0.95} />;
  const left: [number, number, number, number][] = [
    // [z centre, y centre, width, height]
    [0.5, 0.575, 7, 1.15],
    [0.5, 2.775, 7, 0.85],
    [-2.425, 1.75, 1.15, 1.2],
    [1.825, 1.75, 4.35, 1.2],
  ];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]} receiveShadow>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial color="#1a130e" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.004, -0.9]} receiveShadow>
        <planeGeometry args={[2.6, 1.8]} />
        <meshStandardMaterial color="#2b2230" roughness={1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0.5]}>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial color="#0d1119" roughness={1} />
      </mesh>
      <mesh position={[0, H / 2, -3]} receiveShadow>
        <planeGeometry args={[8, H]} />
        {wall}
      </mesh>
      <mesh position={[4, H / 2, 0.5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, H]} />
        {wall}
      </mesh>
      {left.map(([z, y, w, h]) => (
        <mesh key={`${z}-${y}`} position={[-4, y, z]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[w, h]} />
          {wall}
        </mesh>
      ))}
    </group>
  );
}

function Desk() {
  const wood = <meshStandardMaterial color={COLOR.wood} roughness={0.6} />;
  return (
    <group>
      <mesh position={[0, 0.735, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 0.9]} />
        {wood}
      </mesh>
      {[
        [-1.12, -2.9],
        [1.12, -2.9],
        [-1.12, -2.1],
        [1.12, -2.1],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.355, z]} castShadow>
          <boxGeometry args={[0.05, 0.71, 0.05]} />
          {wood}
        </mesh>
      ))}
      {/* The chair, pushed back from the desk. */}
      <group position={[-0.55, 0, -1.5]} rotation={[0, 0.55, 0]}>
        <mesh position={[0, 0.46, 0]} castShadow>
          <boxGeometry args={[0.46, 0.05, 0.44]} />
          <meshStandardMaterial color="#15171c" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.78, 0.2]} castShadow>
          <boxGeometry args={[0.44, 0.6, 0.04]} />
          <meshStandardMaterial color="#15171c" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** The laptop screen cycles `screenLines`, redrawn into a canvas once per line. */
function Laptop() {
  const invalidate = useThree((s) => s.invalidate);
  const [texture, draw] = useMemo(() => {
    const tex = canvasTexture(512, 320, () => {});
    const ctx = (tex.image as HTMLCanvasElement).getContext('2d')!;
    const paint = (step: number) => {
      ctx.fillStyle = '#0a1622';
      ctx.fillRect(0, 0, 512, 320);
      ctx.font = '22px ui-monospace, Menlo, monospace';
      const shown = Math.min(step + 1, 6);
      for (let i = 0; i < shown; i++) {
        const line = screenLines[(step - shown + 1 + i + screenLines.length * 10) % screenLines.length];
        const last = i === shown - 1;
        ctx.fillStyle = last ? '#eaf6ff' : '#5c8fb8';
        ctx.fillText(`${last ? '›' : ' '} ${line}`, 24, 48 + i * 42);
      }
      tex.needsUpdate = true;
    };
    paint(0);
    return [tex, paint] as const;
  }, []);

  useEffect(() => {
    let step = 0;
    const id = window.setInterval(() => {
      draw(++step);
      invalidate();
    }, 1600);
    return () => window.clearInterval(id);
  }, [draw, invalidate]);

  return (
    <group position={[0, 0.76, -2.4]}>
      <mesh position={[0, 0.009, 0]} castShadow>
        <boxGeometry args={[0.46, 0.018, 0.32]} />
        <meshStandardMaterial color="#3a3f48" metalness={0.6} roughness={0.35} />
      </mesh>
      <group position={[0, 0.018, -0.16]} rotation={[-0.28, 0, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.46, 0.3, 0.012]} />
          <meshStandardMaterial color="#3a3f48" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.155, 0.0065]}>
          <planeGeometry args={[0.42, 0.262]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Mug() {
  return (
    <group position={[0.55, 0.76, -2.25]}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.038, 0.1, 24]} />
        <meshStandardMaterial color="#c9cfd6" roughness={0.35} />
      </mesh>
      <mesh position={[0.048, 0.052, 0]}>
        <torusGeometry args={[0.024, 0.007, 8, 20]} />
        <meshStandardMaterial color="#c9cfd6" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.037, 24]} />
        <meshStandardMaterial color="#1e120a" roughness={0.2} />
      </mesh>
      <HitProxy size={[0.16, 0.16, 0.16]} position={[0.01, 0.06, 0]} />
    </group>
  );
}

function Phone() {
  return (
    <group position={[0.32, 0.76, -2.12]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0.004, 0]} castShadow>
        <boxGeometry args={[0.075, 0.008, 0.15]} />
        <meshStandardMaterial color="#111317" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.0085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.066, 0.136]} />
        <meshBasicMaterial color="#4f86c2" toneMapped={false} />
      </mesh>
      {/* The only cool light besides the window — the contrast that keeps the warm from reading as sepia. */}
      <pointLight position={[0, 0.08, 0]} color="#7fb8ff" intensity={0.08} distance={0.7} decay={2} />
      <HitProxy size={[0.14, 0.06, 0.2]} position={[0, 0.02, 0]} />
    </group>
  );
}

const BOOKS = 64;

/** Books are one InstancedMesh with per-instance colour: 64 books, one draw call. */
function Bookshelf() {
  const books = useRef<InstancedMesh>(null!);
  const wood = <meshStandardMaterial color="#231811" roughness={0.7} />;

  useLayoutEffect(() => {
    const rand = seeded(5);
    const o = new Object3D();
    const c = new Color();
    const palette = ['#5a2f2a', '#2d4a5c', '#6b5a33', '#2f4a3a', '#4a3552', '#7a6f60', '#20303f'];
    let i = 0;
    for (const shelfY of [0.06, 0.54, 1.02, 1.5]) {
      let x = -0.58;
      while (x < 0.55 && i < BOOKS) {
        const w = 0.025 + rand() * 0.03;
        const h = 0.26 + rand() * 0.14;
        const lean = rand() > 0.9 ? 0.18 : 0;
        o.position.set(x + w / 2, shelfY + h / 2, 0.02 + rand() * 0.03);
        o.rotation.set(0, 0, lean);
        o.scale.set(w, h, 0.2 + rand() * 0.05);
        o.updateMatrix();
        books.current.setMatrixAt(i, o.matrix);
        books.current.setColorAt(i, c.set(palette[Math.floor(rand() * palette.length)]));
        x += w + 0.004 + (lean ? 0.04 : 0);
        i++;
      }
    }
    books.current.count = i;
    books.current.instanceMatrix.needsUpdate = true;
    if (books.current.instanceColor) books.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group position={[2.55, 0, -2.78]}>
      {[-0.64, 0.64].map((x) => (
        <mesh key={x} position={[x, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.03, 2.0, 0.34]} />
          {wood}
        </mesh>
      ))}
      {[0.03, 0.51, 0.99, 1.47, 1.98].map((y) => (
        <mesh key={y} position={[0, y, 0]} receiveShadow>
          <boxGeometry args={[1.26, 0.03, 0.34]} />
          {wood}
        </mesh>
      ))}
      <instancedMesh ref={books} args={[undefined, undefined, BOOKS]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

function Poster() {
  const map = useMemo(() => canvasTexture(512, 360, drawPoster), []);
  return (
    <group position={[0, 2.15, -2.985]}>
      <mesh>
        <boxGeometry args={[0.96, 0.68, 0.02]} />
        <meshStandardMaterial color="#0b0e13" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[0.9, 0.62]} />
        <meshStandardMaterial map={map} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Corkboard() {
  const map = useMemo(() => canvasTexture(512, 360, drawCork), []);
  return (
    <group position={[-1.9, 1.7, -2.985]}>
      <mesh>
        <boxGeometry args={[1.16, 0.8, 0.03]} />
        <meshStandardMaterial color="#2a1d14" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[1.08, 0.72]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
    </group>
  );
}

function StickyNotes() {
  const notes: [number, number, number, string][] = [
    [-0.12, 0.08, 0.06, '#e8d36a'],
    [0.02, 0.1, -0.08, '#e8d36a'],
    [0.14, 0.05, 0.1, '#e89a9a'],
    [-0.06, -0.06, -0.04, '#9ad7e0'],
    [0.09, -0.08, 0.05, '#e8d36a'],
  ];
  return (
    <group position={[1.05, 1.5, -2.99]}>
      {notes.map(([x, y, r, c]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0.003]} rotation={[0, 0, r]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color={c} roughness={0.9} />
        </mesh>
      ))}
      <HitProxy size={[0.42, 0.34, 0.02]} position={[0.01, 0.01, 0.01]} />
    </group>
  );
}

function Door() {
  return (
    <group position={[3.98, 0, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 1.07, -0.01]}>
        <boxGeometry args={[1.07, 2.16, 0.03]} />
        <meshStandardMaterial color="#10141b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.05, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 2.08, 0.04]} />
        <meshStandardMaterial color="#232a36" roughness={0.75} />
      </mesh>
      <mesh position={[0.38, 1.0, 0.05]}>
        <sphereGeometry args={[0.028, 16, 12]} />
        <meshStandardMaterial color="#9a8a6a" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** The whole room. Everything procedural: no models, no image files. */
export function Scene() {
  const { lite } = useRoom();
  return (
    <>
      <color attach="background" args={[COLOR.void]} />
      <fog attach="fog" args={[COLOR.void, 7, 15]} />

      <WarmDriver />
      <CameraRig />
      <Invalidator />
      <QualityGuard />

      <Ambient />
      <ScreenLight />
      <Lamp />
      <Candle position={[0.95, 0.76, -2.72]} height={0.14} seed={0} />
      <Candle position={[1.08, 0.76, -2.58]} height={0.09} seed={2.3} />
      <Candle position={[-3.86, 1.15, -0.72]} height={0.11} seed={4.9} />
      <DoorStrip />

      <Shell />
      <Weather />
      <Desk />

      <Interactive section="build"><Laptop /></Interactive>
      <Interactive section="play"><Mug /></Interactive>
      <Interactive section="contact"><Phone /></Interactive>
      <Interactive section="record"><Bookshelf /></Interactive>
      <Interactive section="projects"><Poster /></Interactive>
      <Interactive section="about"><Corkboard /></Interactive>
      <Interactive section="leadership"><StickyNotes /></Interactive>
      <Interactive section="resume"><Door /></Interactive>

      {!lite && <Dust />}
    </>
  );
}
