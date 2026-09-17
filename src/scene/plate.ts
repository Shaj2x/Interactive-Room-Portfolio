import type { HotspotDef } from './hotspots';
import plateImage from '../assets/room-plate.webp';

/**
 * PAINTED-PLATE ART PATH
 * ----------------------
 * The room is a single painted image — the "plate" — with the light and
 * weather re-created as animated overlays on top of it.
 *
 * A plate is one flat picture: no separated layers, so no true per-object
 * parallax, and nothing in it moves. So the plate supplies the look, and
 * everything that has to breathe is rebuilt over it from the same CSS
 * animations the SVG room uses. The plate takes a small parallax drift and the
 * overlays take more, which reads as depth without real layers.
 *
 * Every coordinate below is in the same 1600 x 900 space the SVG room uses,
 * and the plate is exactly 1600 x 900, so image pixels map 1:1 onto scene
 * coordinates: what you measure in the picture is what you write here.
 */

/** `null` falls back to the hand-built SVG room in `scene/layers/*`. */
export const plateSrc: string | null = plateImage;

export interface PlateLight {
  id: string;
  /** `cool` uses the blue bloom, `warm` the amber one. */
  kind: 'cool' | 'warm';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** 0..1. Kept low — this sits on top of light the painting already has. */
  intensity: number;
}

/**
 * In this plate the laptop is the COOL light and the desk lamp is the warm
 * one — the reverse of the SVG room. Measured off the image.
 */
export const plateLights: PlateLight[] = [
  { id: 'laptop', kind: 'cool', cx: 196, cy: 498, rx: 290, ry: 240, intensity: 0.34 },
  { id: 'lamp', kind: 'warm', cx: 58, cy: 400, rx: 230, ry: 200, intensity: 0.42 },
  { id: 'door', kind: 'warm', cx: 1558, cy: 742, rx: 95, ry: 120, intensity: 0.5 },
  { id: 'window', kind: 'cool', cx: 1052, cy: 250, rx: 230, ry: 205, intensity: 0.22 },
];

/** The window glass, for the animated rain overlay. */
export const plateWindow: { x: number; y: number; w: number; h: number } | null = {
  x: 898,
  y: 28,
  w: 320,
  h: 436,
};

/**
 * Hotspot boxes measured off the plate. The objects sit in different places
 * than they do in the SVG scene, so the plate carries its own set.
 */
export const plateHotspots: HotspotDef[] = [
  {
    id: 'build',
    label: 'What I build',
    description: 'What I build — services, the product flow and how an engagement works',
    x: 140, y: 422, w: 134, h: 156, depth: 0.15, order: 1,
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Projects shipped — six builds with repositories and live demos',
    x: 404, y: 54, w: 88, h: 168, depth: 0.15, order: 2,
  },
  {
    id: 'record',
    label: 'Record',
    description: 'Record — education and work history',
    x: 528, y: 118, w: 200, h: 380, depth: 0.15, order: 3,
  },
  {
    id: 'about',
    label: 'About',
    description: 'About me — background and the facts',
    x: 0, y: 72, w: 338, h: 288, depth: 0.15, order: 4,
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Leadership and community roles',
    x: 400, y: 246, w: 96, h: 80, depth: 0.15, order: 5,
  },
  {
    id: 'play',
    label: 'Play',
    description: 'Play — browser games and the toolkit',
    x: 82, y: 500, w: 58, h: 54, depth: 0.15, order: 6,
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Contact — book a thirty minute call',
    x: 30, y: 556, w: 80, h: 44, depth: 0.15, order: 7,
  },
  {
    id: 'resume',
    label: 'Résumé',
    description: 'Résumé and links out',
    x: 1400, y: 40, w: 200, h: 740, depth: 0.15, order: 8,
  },
];
