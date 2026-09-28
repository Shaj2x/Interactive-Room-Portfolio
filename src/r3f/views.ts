import type { SectionId } from '../content/profile';

type Vec3 = [number, number, number];

/** Where the camera stands and what it looks at. Units are metres. */
export interface View {
  position: Vec3;
  target: Vec3;
}

export const HOME: View = { position: [0.5, 1.6, 3.6], target: [-0.3, 1.2, -2] };

/** One view per section, framed on the object that opens it. */
export const VIEWS: Record<SectionId, View> = {
  build: { position: [0.1, 1.28, -1.25], target: [0, 0.9, -2.5] },
  play: { position: [0.72, 1.02, -1.62], target: [0.55, 0.82, -2.25] },
  contact: { position: [0.3, 1.18, -1.62], target: [0.32, 0.77, -2.12] },
  record: { position: [1.9, 1.3, -0.2], target: [2.55, 1.05, -2.8] },
  projects: { position: [0, 2.0, -0.85], target: [0, 2.12, -3] },
  about: { position: [-1.7, 1.72, -0.9], target: [-1.9, 1.7, -3] },
  leadership: { position: [1.0, 1.52, -1.85], target: [1.05, 1.5, -3] },
  resume: { position: [1.9, 1.35, 0.9], target: [4, 1.1, 0.4] },
};

/** Shared palette, mirrored from styles/tokens.css. */
export const COLOR = {
  void: '#04060a',
  screen: '#bfe4ff',
  amber: '#ffb567',
  flame: '#ff9a3c',
  accent: '#5fe7e0',
  wall: '#1b2331',
  wood: '#2a1d14',
} as const;
