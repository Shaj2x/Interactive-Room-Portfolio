import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';
import type { ComponentProps, CSSProperties } from 'react';

type GradientProps = ComponentProps<typeof ShaderGradient>;

interface GradientBackdropProps extends GradientProps {
  style?: CSSProperties;
  className?: string;
}

/**
 * Animated WebGL gradient (ruucm/shadergradient). Pulls in three.js, so import
 * it lazily: `const GradientBackdrop = lazy(() => import('./components/GradientBackdrop'))`.
 * Presets can be built at https://shadergradient.co/customize and passed as
 * props, or as `control="query" urlString="..."`.
 */
export default function GradientBackdrop({ style, className, ...gradient }: GradientBackdropProps) {
  return (
    <ShaderGradientCanvas
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}
      pixelDensity={1}
      fov={45}
    >
      <ShaderGradient
        type="waterPlane"
        animate="on"
        uSpeed={0.2}
        uStrength={1.5}
        uDensity={1.3}
        color1="#1b1030"
        color2="#e0823d"
        color3="#0b0b14"
        lightType="3d"
        grain="on"
        {...gradient}
      />
    </ShaderGradientCanvas>
  );
}
