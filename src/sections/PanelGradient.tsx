import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

/**
 * The moving light behind every section panel: a ShaderGradient
 * (github.com/ruucm/shadergradient) tuned to the room's palette. Navy
 * shadow, teal from the screen and a little amber from the lamp, drifting
 * slowly enough to read as light, not as decoration.
 *
 * Loaded lazily by SectionShell, so three.js is only downloaded the first
 * time someone opens a section, never for the room itself.
 */
export default function PanelGradient({ still }: { still: boolean }) {
  return (
    <ShaderGradientCanvas
      className="panel-gradient-canvas"
      pointerEvents="none"
      pixelDensity={1}
      fov={45}
      lazyLoad={false}
    >
      <ShaderGradient
        control="props"
        type="waterPlane"
        // Reduced motion keeps the gradient and stops the drift.
        animate={still ? 'off' : 'on'}
        uTime={0.4}
        uSpeed={0.08}
        uStrength={2.2}
        uDensity={1.3}
        uFrequency={5.5}
        uAmplitude={0}
        color1="#1a3450"
        color2="#1f7f86"
        color3="#c27a3a"
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
        cAzimuthAngle={180}
        cPolarAngle={80}
        cDistance={2.8}
        cameraZoom={9.1}
        // '3d' lights, not 'env': env mode fetches HDR files from another host.
        lightType="3d"
        brightness={1.2}
        reflection={0.1}
        // The room already has film grain; a second layer behind text is noise.
        grain="off"
        enableTransition={false}
      />
    </ShaderGradientCanvas>
  );
}
