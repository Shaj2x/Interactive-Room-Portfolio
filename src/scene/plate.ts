import type { HotspotDef } from './hotspots';

/**
 * PAINTED-PLATE ART PATH
 * ----------------------
 * The room can be drawn two ways:
 *
 *   1. The hand-built SVG scene in `scene/layers/*` (the default, zero assets).
 *   2. A single painted image — a "plate" — with the light, weather and dust
 *      re-created as animated overlays on top of it.
 *
 * Path 2 is what this file configures. A generated painting gives a far richer
 * room than SVG ever will, but it arrives as one flat picture: no separated
 * layers, so no true per-object parallax, and nothing in it can move.
 *
 * So the plate supplies the *look*, and everything that has to breathe is
 * rebuilt over it from the same CSS animations the SVG room uses: the screen
 * bloom, the lamp bloom, the door leak, rain on the window, drifting dust,
 * grain and vignette. The plate itself takes a small parallax drift and the
 * overlays take more, which reads as depth without needing real layers.
 *
 * TO TURN IT ON: set `plateSrc` to the image and fill in the coordinates below.
 * Every coordinate is in the same 1600 x 900 scene space the SVG uses, so the
 * hotspot maths, the parallax and the portrait reframing all keep working
 * unchanged.
 */

/** `null` keeps the SVG room. Set to an imported image to use the painting. */
export const plateSrc: string | null = null;

/** A light in the painting that should breathe. Positions are scene coords. */
export interface PlateLight {
  id: string;
  kind: 'screen' | 'warm' | 'window';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** 0..1. Keep low — this sits on top of light the painting already has. */
  intensity: number;
}

/**
 * Filled in once the plate image exists, by reading the object positions
 * straight off the painting. Until then the list is empty and the overlays
 * simply do not render.
 */
export const plateLights: PlateLight[] = [];

/** The window's rain overlay, if the plate has a window. Scene coords. */
export const plateWindow: { x: number; y: number; w: number; h: number } | null = null;

/**
 * Hotspot boxes for the painted room. The objects sit in different places than
 * they do in the SVG scene, so the plate carries its own set; `hotspots.ts`
 * picks whichever matches the active art path.
 */
export const plateHotspots: HotspotDef[] = [];
