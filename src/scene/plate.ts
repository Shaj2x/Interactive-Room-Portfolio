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
 * Measured off the plate. In this room the warm sources are the laptop screen
 * and the light under the door; the cool ones are the window and the phone
 * face on the desk. That is the reverse of the SVG room, where the laptop is
 * the cold key light.
 */
export const plateLights: PlateLight[] = [
  { id: 'laptop', kind: 'warm', cx: 556, cy: 540, rx: 200, ry: 155, intensity: 0.3 },
  { id: 'board', kind: 'warm', cx: 210, cy: 400, rx: 235, ry: 225, intensity: 0.24 },
  { id: 'door', kind: 'warm', cx: 1482, cy: 440, rx: 46, ry: 430, intensity: 0.5 },
  { id: 'window', kind: 'cool', cx: 1140, cy: 250, rx: 210, ry: 200, intensity: 0.22 },
];

/*
 * The phone on the desk is deliberately not in that list. It already glows in
 * the painting, and every entry here is a blurred, screen-blended element that
 * the scene has to re-composite whenever the parallax moves — about a frame
 * and a half each. Four earns its place; a fifth for a light already in the
 * picture does not.
 */

/**
 * The window glass, for the animated rain overlay — both panes and the mullion
 * between them. The painting already has rain on the glass; this rides on top
 * of it so the weather keeps moving.
 */
export const plateWindow: { x: number; y: number; w: number; h: number } | null = {
  x: 980,
  y: 58,
  w: 322,
  h: 378,
};

/**
 * Hotspot boxes measured off the plate, in its own 1600 x 900 pixel space.
 *
 * The corkboard carries two of them: the pinned notes are About, the two
 * photographs below them are Leadership. They do not overlap, so each is its
 * own find rather than a button hidden inside another button.
 *
 * Deliberately NOT hotspots: the window (ambient only), the bed, and the
 * plants. If everything is clickable, nothing is a discovery.
 */
export const plateHotspots: HotspotDef[] = [
  {
    id: 'build',
    label: 'What I build',
    description: 'What I build — services, the product flow and how an engagement works',
    // The lit laptop screen, from the edge of the silhouette to its right bezel.
    x: 500, y: 474, w: 104, h: 128, depth: 0.15, order: 1,
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Projects shipped — six builds with repositories and live demos',
    // The framed print above the bookshelf.
    x: 670, y: 14, w: 158, h: 190, depth: 0.15, order: 2,
  },
  {
    id: 'record',
    label: 'Record',
    description: 'Record — education and work history',
    // The bookshelf: from the objects on its top board down to the desk,
    // stopping short of the mug.
    x: 606, y: 232, w: 232, h: 322, depth: 0.15, order: 3,
  },
  {
    id: 'about',
    label: 'About',
    description: 'About me — background and the facts',
    // The pinned notes on the corkboard.
    x: 100, y: 118, w: 220, h: 158, depth: 0.15, order: 4,
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Leadership and community roles',
    // The two photographs pinned below the notes.
    x: 98, y: 284, w: 118, h: 102, depth: 0.15, order: 5,
  },
  {
    id: 'play',
    label: 'Play',
    description: 'Play — browser games and the toolkit',
    // The mug.
    x: 654, y: 556, w: 62, h: 58, depth: 0.15, order: 6,
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Contact — book a thirty minute call',
    // The phone face-up on the desk, the one cool light in the room.
    x: 692, y: 616, w: 74, h: 38, depth: 0.15, order: 7,
  },
  {
    id: 'resume',
    label: 'Résumé',
    description: 'Résumé and links out',
    // The door: the strip of hall light, its handle, and the leaf around them.
    // Wide on purpose — at portrait width the scene renders about a quarter
    // size, so a box hugging the 25px strip would be a 6px tap target.
    x: 1396, y: 56, w: 200, h: 788, depth: 0.15, order: 8,
  },
];
