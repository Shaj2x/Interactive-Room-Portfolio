/**
 * Foreground: out-of-focus edges and the dust drifting through the light.
 * Depth 1.3 — nearest the camera, so it takes the most parallax, which is what
 * sells the 2.5D. Nothing here is interactive.
 *
 * Dust is animated with CSS keyframes rather than rAF on purpose: CSS
 * animations run off the main thread, so the motes keep moving smoothly while
 * React is mounting a section.
 */

/** Deterministic motes — a fixed table, so the scene composes the same way
 *  on every load and across reloads. Concentrated in the light. */
const DUST = [
  { x: 980, y: 470, r: 1.9, dur: 26, delay: 0, drift: 34, o: 0.5 },
  { x: 1070, y: 520, r: 1.3, dur: 34, delay: 3, drift: -28, o: 0.38 },
  { x: 1140, y: 440, r: 2.2, dur: 29, delay: 7, drift: 40, o: 0.44 },
  { x: 900, y: 540, r: 1.5, dur: 31, delay: 11, drift: -22, o: 0.34 },
  { x: 1020, y: 400, r: 1.1, dur: 38, delay: 2, drift: 26, o: 0.3 },
  { x: 1200, y: 560, r: 1.8, dur: 27, delay: 14, drift: -36, o: 0.4 },
  { x: 860, y: 460, r: 1.2, dur: 35, delay: 6, drift: 30, o: 0.28 },
  { x: 1240, y: 480, r: 1.6, dur: 30, delay: 9, drift: -24, o: 0.36 },
  { x: 500, y: 500, r: 1.4, dur: 33, delay: 4, drift: 28, o: 0.24 },
  { x: 440, y: 440, r: 1.1, dur: 40, delay: 16, drift: -20, o: 0.2 },
  { x: 560, y: 560, r: 1.7, dur: 28, delay: 12, drift: 32, o: 0.22 },
  { x: 1320, y: 520, r: 1.3, dur: 36, delay: 1, drift: -30, o: 0.26 },
  { x: 760, y: 420, r: 1.2, dur: 32, delay: 18, drift: 24, o: 0.22 },
  { x: 1100, y: 620, r: 2.0, dur: 25, delay: 8, drift: -38, o: 0.34 },
  { x: 640, y: 600, r: 1.5, dur: 37, delay: 5, drift: 22, o: 0.2 },
  { x: 1180, y: 380, r: 1.0, dur: 42, delay: 20, drift: 18, o: 0.18 },
];

export function ForegroundLayer() {
  return (
    <g id="layer-foreground">
      <g className="dust-field" aria-hidden="true">
        {DUST.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill="#dff0ff"
            className="dust"
            style={
              {
                '--dust-dur': `${d.dur}s`,
                '--dust-delay': `${-d.delay}s`,
                '--dust-drift': `${d.drift}px`,
                '--dust-o': d.o,
              } as React.CSSProperties
            }
          />
        ))}
      </g>

      {/* Blurred near-camera edges. They frame the shot and hide the crop. */}
      <g filter="url(#f-fore-blur)" opacity="0.92">
        <path d="M0 900 L0 690 C110 760 180 838 208 900 Z" fill="#020407" />
        <path d="M1600 900 L1600 706 C1494 774 1424 842 1398 900 Z" fill="#020407" />
      </g>
    </g>
  );
}
