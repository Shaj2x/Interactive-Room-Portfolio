import type { HotspotDef } from './hotspots';
import plateImage from '../assets/room-plate.jpg';

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
 * Every coordinate below is in the same 1600 x 900 space the SVG room uses.
 * The plate itself is larger than that — it ships at its native resolution so
 * it stays sharp on a high-density display — and the browser scales it into
 * the 1600 x 900 box. The image's own pixel size therefore has no bearing on
 * anything here: measure in 1600 x 900 scene units and write that down.
 *
 * The plate is shipped exactly as supplied, with no resize and no re-encode.
 * It was briefly stored downscaled and recompressed, which quietly erased the
 * raindrops on the window glass and the lettering on the book spines — the
 * fine detail this picture is carried by. If it ever needs to be replaced,
 * replace it; do not "optimise" it.
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
  /**
   * How far this light is allowed to dip when it flickers, as a fraction of
   * its intensity. Only warm lights flicker; the city outside is too far away
   * to do anything but sit there. Omitted means it holds steady.
   */
  swing?: number;
}

/**
 * Measured off the plate. In this room the warm sources are the laptop screen
 * and the light under the door; the cool ones are the window and the phone
 * face on the desk. That is the reverse of the SVG room, where the laptop is
 * the cold key light.
 */
export const plateLights: PlateLight[] = [
  // The laptop is the key light and the steadiest thing here: a screen wavers,
  // it does not gutter.
  { id: 'laptop', kind: 'warm', cx: 556, cy: 540, rx: 200, ry: 155, intensity: 0.3, swing: 0.12 },
  // The warm wash the desk throws onto the corkboard. It is lit by the laptop,
  // so it moves with it and a little more, being further from the source.
  { id: 'board', kind: 'warm', cx: 210, cy: 400, rx: 235, ry: 225, intensity: 0.26, swing: 0.2 },
  // The hall light under the door — a different circuit, and the one thing in
  // frame allowed to properly misbehave.
  { id: 'door', kind: 'warm', cx: 1482, cy: 440, rx: 46, ry: 430, intensity: 0.5, swing: 0.3 },
  // The city. Steady: those lights are a kilometre away.
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
 * Lights that pulse.
 *
 * The blooms above can only ADD light, and the light in this room is painted
 * into the photograph: the strip under the door is already bright before
 * anything renders on top of it. Brightening a glow that sits over a constant
 * bright strip changes almost nothing, which is why the blooms alone read as
 * completely steady no matter what drives them.
 *
 * So these take light away instead. Each is a black rectangle over one light
 * source; at opacity `a` it leaves `(1 - a)` of the painting showing, so
 * animating that opacity dims and restores the painted light. Plain alpha,
 * deliberately — compositing black over the picture gives exactly the same
 * result as multiplying by it, without a blend mode's cost.
 *
 * The motion is a slow swell rather than a flicker: both lights rise and fall
 * on a long cosine, far too gradually to catch in the act, so the room reads
 * as breathing rather than faulty.
 */
export interface PlatePulse {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** The dim at the bottom of the swell, 0..1. Also where reduced motion parks it. */
  rest: number;
  /** The keyframe class that drives it. */
  animation: string;
  /** Corner rounding, for a source with a hard edge of its own. */
  rx?: number;
  /**
   * Fades out toward its own edges instead of stopping at them. For a light
   * whose glow has no edge — a screen washing onto a desk — a rectangle that
   * dims to its border would draw one.
   */
  soft?: boolean;
}

export const platePulses: PlatePulse[] = [
  // The strip of hall light under the door, swelling over eleven seconds.
  // Generous margins — everything either side of it is near-black already, so
  // dimming that shows nothing.
  { id: 'door-strip', x: 1462, y: 0, w: 40, h: 900, rest: 0.03, animation: 'pulse-hall', rx: 6 },
  // The laptop screen, slower and shallower still. It is the brightest thing
  // in frame; anything more than a drift here reads as a fault.
  { id: 'laptop-screen', x: 486, y: 458, w: 140, h: 164, rest: 0.02, animation: 'pulse-screen', soft: true },
];

/**
 * The glass, one entry per pane.
 *
 * Two rectangles rather than one, because the mullion between them and the
 * frame around them are solid: rain drawn across those reads as rain falling
 * on the picture rather than weather seen through a window.
 *
 * The bright glass was found by luminance rather than by eye — the left pane
 * runs x 980..1167, the right x 1191..1301, both y 56..432. These sit a few
 * units inside that on every side, so the clip can never graze the frame even
 * with the antialiasing along its edge.
 *
 * Both panes are the same height on purpose: the drops share one keyframe, and
 * it has to carry them from above the top edge to the bottom one.
 */
export interface PlateGlass {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const plateGlass: PlateGlass[] = [
  { id: 'left', x: 984, y: 60, w: 178, h: 366 },
  { id: 'right', x: 1195, y: 60, w: 102, h: 366 },
];

/**
 * A slow breath across the whole room.
 *
 * Same trick as the lights: black over the picture, and animating its opacity
 * takes brightness out and gives it back. It rests at nothing and swells to a
 * little over a fifth, across nineteen seconds — so the room sits between 78%
 * and 100% of the photograph, and at its lightest is exactly the photograph.
 * Nineteen shares no multiple with the hall light's eleven or the screen's
 * seventeen, so the three never resolve into one beat.
 */
export const plateRoomBreath = { animation: 'pulse-room' } as const;

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
