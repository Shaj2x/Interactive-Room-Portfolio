import type { SectionId } from '../content/profile';
import { plateHotspots, plateSrc } from './plate';

/**
 * The room's navigation. Each hotspot is an ordinary object in the scene that
 * happens to be clickable. Coordinates are in the 1600x900 scene viewBox and
 * are converted to percentages by <Hotspot>, so the HTML buttons land exactly
 * on top of the SVG art at any viewport size.
 *
 * `depth` must match the parallax depth of the SVG layer the object is drawn
 * on, or the button will drift away from its art as the mouse moves.
 *
 * Deliberately NOT hotspots: the window (ambient only) and the lamp (an easter
 * egg that dims the room). If everything is clickable, nothing is a discovery.
 */
export interface HotspotDef {
  id: SectionId;
  label: string;
  /** Read out to screen readers in place of the bare label. */
  description: string;
  /** Bounding box in scene coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  /** Order in the keyboard tab ring and the plain nav menu. */
  order: number;
}

/**
 * At portrait width the scene is fitted, not cropped, so everything stays on
 * screen — but that shrinks a 92px mug to about 22 CSS pixels. Anything under
 * ~44px square is not an honest tap target, so on compact screens only the
 * large objects stay tappable and the full list sits underneath the room.
 */
export function isTappableWhenCompact(h: HotspotDef): boolean {
  return h.w >= 200 && h.h >= 200;
}

/** Object positions in the hand-built SVG room. */
const SVG_HOTSPOTS: HotspotDef[] = [
  {
    id: 'build',
    label: 'What I build',
    description: 'What I build — services, the product flow and how an engagement works',
    x: 426, y: 368, w: 144, h: 180, depth: 0.55, order: 1,
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Projects shipped — six builds with repositories and live demos',
    x: 604, y: 14, w: 200, h: 154, depth: 0.15, order: 2,
  },
  {
    id: 'record',
    label: 'Record',
    description: 'Record — education and work history',
    x: 560, y: 146, w: 252, h: 290, depth: 0.35, order: 3,
  },
  {
    id: 'about',
    label: 'About',
    description: 'About me — background and the facts',
    x: 2, y: 20, w: 214, h: 334, depth: 0.15, order: 4,
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Leadership and community roles',
    x: 314, y: 118, w: 138, h: 144, depth: 0.15, order: 5,
  },
  {
    id: 'play',
    label: 'Play',
    description: 'Play — browser games and the toolkit',
    x: 586, y: 444, w: 96, h: 82, depth: 0.55, order: 6,
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Contact — book a thirty minute call',
    x: 632, y: 528, w: 100, h: 50, depth: 0.55, order: 7,
  },
  {
    id: 'resume',
    label: 'Résumé',
    description: 'Résumé and links out',
    x: 1400, y: 0, w: 200, h: 790, depth: 0.15, order: 8,
  },
];

/**
 * The active set. The painted plate puts the objects in different places than
 * the SVG room does, so each art path carries its own coordinates and
 * everything downstream — the buttons, the menus, the keyboard order — reads
 * from whichever is live.
 */
export const HOTSPOTS: HotspotDef[] =
  plateSrc && plateHotspots.length > 0 ? plateHotspots : SVG_HOTSPOTS;

export const HOTSPOT_BY_ID = Object.fromEntries(
  HOTSPOTS.map((h) => [h.id, h]),
) as Record<SectionId, HotspotDef>;

/** Parallax depth of each drawn layer. Larger = nearer the camera = moves more. */
export const DEPTH = {
  wall: 0.15,
  furniture: 0.35,
  desktop: 0.55,
  person: 0.85,
  foreground: 1.3,
} as const;
