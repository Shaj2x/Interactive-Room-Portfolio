import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, Color, type ShaderMaterial } from 'three';
import { useRoom } from './context';
import { seeded } from './textures';

const COUNT = 420;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float t = uTime * 0.05 + aSeed * 10.0;
    p.x += sin(t * 1.3) * 0.18;
    p.y += sin(t * 0.7) * 0.12;
    p.z += cos(t * 0.9) * 0.18;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Capped, so a mote drifting past the lens stays a mote, not a blob.
    gl_PointSize = min(uSize * uPixelRatio / -mv.z, 5.0 * uPixelRatio);
    vAlpha = 0.3 + 0.7 * fract(aSeed * 7.13);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vAlpha * uOpacity);
  }
`;

/**
 * Drifting dust. Each mote's motion is computed in the vertex shader from one
 * time uniform, so the CPU writes a single float per frame instead of 1,260.
 * It catches the warm light: when the lamp goes out, the dust nearly vanishes.
 */
export function Dust() {
  const { warm, reduced } = useRoom();
  const dpr = useThree((s) => s.viewport.dpr);
  const mat = useRef<ShaderMaterial>(null!);

  const [positions, seeds] = useMemo(() => {
    const rand = seeded(9);
    const p = new Float32Array(COUNT * 3);
    const s = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      p.set([-3.2 + rand() * 6.4, 0.2 + rand() * 2.7, -2.8 + rand() * 4.6], i * 3);
      s[i] = rand();
    }
    return [p, s];
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 14 },
      uPixelRatio: { value: dpr },
      uColor: { value: new Color('#ffd9a8') },
      uOpacity: { value: 0.6 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, dt) => {
    const u = mat.current.uniforms;
    if (!reduced) u.uTime.value += dt;
    u.uPixelRatio.value = dpr;
    u.uOpacity.value = 0.08 + 0.34 * warm.current;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
