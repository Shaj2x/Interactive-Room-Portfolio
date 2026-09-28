import { createContext, useContext, type MutableRefObject } from 'react';
import type { SectionId } from '../content/profile';

/**
 * Shared state for the 3D room. React state holds what changes on user intent
 * (selection, hover, lamp); refs hold what changes every frame (the warm light
 * level), because setState inside useFrame would re-render 60 times a second.
 */
export interface RoomState {
  selected: SectionId | null;
  hovered: SectionId | null;
  /** `instant` cuts the camera instead of flying it — for keyboard navigation. */
  select: (id: SectionId | null, opts?: { instant?: boolean }) => void;
  hover: (id: SectionId) => void;
  unhover: (id: SectionId) => void;
  lampOn: boolean;
  toggleLamp: () => void;
  reduced: boolean;
  canHover: boolean;
  lite: boolean;
  setLite: (lite: boolean) => void;
  /** 0..1, damped toward lampOn. Every warm light in the room multiplies by it. */
  warm: MutableRefObject<number>;
  /** Consumed once by the camera rig: snap to the next view instead of flying. */
  instantCut: MutableRefObject<boolean>;
}

export const RoomContext = createContext<RoomState | null>(null);

export function useRoom(): RoomState {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used inside <RoomContext.Provider>');
  return ctx;
}
