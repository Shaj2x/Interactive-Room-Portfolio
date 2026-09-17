import type { HotspotDef } from './hotspots';

const VB_W = 1600;
const VB_H = 900;

interface Props {
  spot: HotspotDef;
  onOpen: (id: HotspotDef['id']) => void;
  /** The one hotspot that pulses once on first load to teach the interaction. */
  hinting: boolean;
  /** Labels stay visible on touch, where there is no hover to reveal them. */
  alwaysLabel: boolean;
  /** A section is open: take the room's objects out of the tab ring entirely. */
  disabled: boolean;
}

/**
 * A hotspot is an HTML <button> positioned over the SVG art in percentages of
 * the stage. Because the stage is locked to the same 16:9 as the scene's
 * viewBox, a percentage maps exactly onto a viewBox coordinate at any size.
 *
 * It is a real button: focusable, named, Enter/Space activated. The room is
 * the fun way to navigate, never the only way — see <NavMenu>.
 */
export function Hotspot({ spot, onOpen, hinting, alwaysLabel, disabled }: Props) {
  // A label centred under an object near the frame edge runs off screen. Anchor
  // it to whichever side has room instead of centring it blindly.
  const centre = (spot.x + spot.w / 2) / VB_W;
  const anchor = centre > 0.78 ? 'right' : centre < 0.22 ? 'left' : 'centre';

  return (
    <button
      type="button"
      disabled={disabled}
      className={`hotspot${hinting ? ' is-hinting' : ''}${alwaysLabel ? ' is-labelled' : ''}`}
      style={{
        left: `${(spot.x / VB_W) * 100}%`,
        top: `${(spot.y / VB_H) * 100}%`,
        width: `${(spot.w / VB_W) * 100}%`,
        height: `${(spot.h / VB_H) * 100}%`,
      }}
      aria-label={spot.description}
      onClick={() => onOpen(spot.id)}
    >
      <span className="hotspot-rim" aria-hidden="true" />
      <span className="hotspot-label" data-anchor={anchor} aria-hidden="true">
        {spot.label}
      </span>
    </button>
  );
}
