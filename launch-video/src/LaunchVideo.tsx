import { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/**
 * Launch video for the Interactive Room Portfolio.
 *
 * All footage is the real site: `public/room.webm` is a Playwright recording
 * of the live room and `public/shots/*` are screenshots of its sections. The
 * only text added on top is the captions; every UI label on screen is the
 * site's own.
 *
 * Beats (30fps):
 *   Hook       0-90    the room, raining, slow push-in
 *   Discovery  90-222  hover tour, zoomed so the real labels are readable
 *   Click      222-322 the laptop opens "What I build"
 *   Inside     322-457 stats, projects, book a call
 *   Endcard    457-570 name, positioning, link
 */

const FPS = 30;
export const DURATION = 570;
const FADE = 10;

const C = {
  void: '#04060a',
  text: '#dfe9f4',
  dim: '#93a5b8',
  accent: '#5fe7e0',
  screen: '#bfe4ff',
};
const SERIF = "'Instrument Serif', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";
const MONO = "ui-monospace, 'DejaVu Sans Mono', Menlo, monospace";

const ease = Easing.bezier(0.23, 1, 0.32, 1);
const inOut = Easing.bezier(0.77, 0, 0.175, 1);

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Instrument Serif', `url(${staticFile('fonts/InstrumentSerif.woff2')})`),
      new FontFace('Instrument Serif', `url(${staticFile('fonts/InstrumentSerif-Italic.woff2')})`, {
        style: 'italic',
      }),
      new FontFace('Inter', `url(${staticFile('fonts/Inter.woff2')})`, { weight: '400 600' }),
    ];
    Promise.all(faces.map((f) => f.load())).then((loaded) => {
      loaded.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    });
  }, [handle]);
};

/** Fades in over the first FADE frames; the next scene overlaps the tail. */
const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, FADE], [0, 1], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ opacity, backgroundColor: C.void }}>{children}</AbsoluteFill>;
};

/**
 * Pan/zoom a 1920x1080 frame so scene point (cx, cy) moves toward the centre
 * at scale s, clamped so the frame never shows its edges.
 */
const camera = (s: number, cx: number, cy: number) => {
  const tx = Math.min(0, Math.max(1920 - 1920 * s, 960 - cx * s));
  const ty = Math.min(0, Math.max(1080 - 1080 * s, 540 - cy * s));
  return `translate(${tx}px, ${ty}px) scale(${s})`;
};

const Footage: React.FC<{ from: number; transform: string }> = ({ from, transform }) => (
  <AbsoluteFill style={{ transform, transformOrigin: '0 0' }}>
    <OffthreadVideo src={staticFile('room.webm')} trimBefore={Math.round(from * FPS)} muted />
  </AbsoluteFill>
);

const Still: React.FC<{ src: string; transform: string }> = ({ src, transform }) => (
  <AbsoluteFill style={{ transform, transformOrigin: '0 0' }}>
    <Img src={staticFile(src)} />
  </AbsoluteFill>
);

/** Burned-in caption: small mono kicker over a serif line, on a floor gradient. */
const Caption: React.FC<{ kicker?: string; line: string; delay?: number }> = ({
  kicker,
  line,
  delay = 6,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const f = frame - delay;
  const out = interpolate(frame, [durationInFrames - FADE - 8, durationInFrames - FADE], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p = out * interpolate(f, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end' }}>
      <div
        style={{
          height: 420,
          background: 'linear-gradient(to top, rgba(4,6,10,0.92) 0%, rgba(4,6,10,0.6) 45%, rgba(4,6,10,0) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 120px 96px',
        }}
      >
        {kicker && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 26,
              letterSpacing: '0.24em',
              color: C.accent,
              marginBottom: 18,
              opacity: p,
            }}
          >
            {kicker}
          </div>
        )}
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 104,
            lineHeight: 1.2,
            color: C.text,
            opacity: p,
            transform: `translateY(${(1 - p) * 24}px)`,
            filter: `blur(${(1 - p) * 8}px)`,
          }}
        >
          {line}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- scenes */

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 100], [1.14, 1.22], { extrapolateRight: 'clamp' });
  // Centred right of the desk so the site's own header stays out of frame.
  return (
    <Fade>
      <Footage from={4.2} transform={camera(s, 1150, 440)} />
      <Caption kicker="SHAJITH SASIKUMAR" line="My portfolio is a room." delay={4} />
    </Fade>
  );
};

/** One hover beat: the real footage, pushed in on the object being hovered. */
const Hover: React.FC<{ from: number; cx: number; cy: number; zoom?: number }> = ({ from, cx, cy, zoom = 1.75 }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 44], [zoom, zoom + 0.15], { extrapolateRight: 'clamp' });
  return (
    <Fade>
      <Footage from={from} transform={camera(s, cx, cy)} />
    </Fade>
  );
};

const Discovery: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={48}>
      <Hover from={11.7} cx={250} cy={640} zoom={2.2} />
    </Sequence>
    <Sequence from={42} durationInFrames={48}>
      <Hover from={13.9} cx={753} cy={540} zoom={1.6} />
    </Sequence>
    <Sequence from={84} durationInFrames={48}>
      <Hover from={16.1} cx={537} cy={200} />
    </Sequence>
    <Caption kicker="HOVER TO FIND IT" line="Every object is a way in." delay={FADE} />
  </AbsoluteFill>
);

/** The money shot: the cursor on the laptop, the click, the panel opening. */
const Click: React.FC = () => {
  const f = useCurrentFrame();
  // Hold tight on the hovered laptop, then pull back to full frame just
  // before the click lands (~f 51) so the panel opens in view.
  const s = interpolate(f, [0, 26, 48], [1.6, 1.7, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: inOut,
  });
  const capOut = interpolate(f, [30, 42], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Fade>
      <Footage from={21.0} transform={camera(s, 250, 620)} />
      <AbsoluteFill style={{ opacity: capOut }}>
        <Caption kicker="CLICK TO GO IN" line="Click the laptop." delay={FADE} />
      </AbsoluteFill>
    </Fade>
  );
};

/** A section screenshot with a slow, eased pan between two camera states. */
const Section: React.FC<{
  src: string;
  a: [number, number, number];
  b: [number, number, number];
  dur: number;
  /** Frames to hold on `a` before moving, e.g. to finish a cross-fade first. */
  hold?: number;
}> = ({ src, a, b, dur, hold = 0 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [hold, dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: inOut });
  const lerp = (i: number) => a[i] + (b[i] - a[i]) * t;
  return (
    <Fade>
      <Still src={src} transform={camera(lerp(0), lerp(1), lerp(2))} />
    </Fade>
  );
};

const Inside: React.FC = () => (
  <AbsoluteFill>
    {/* What I build: the two stats and the line under them */}
    <Sequence durationInFrames={50}>
      <Section src="shots/sec-build.png" a={[1.0, 960, 540]} b={[1.65, 960, 420]} dur={50} hold={FADE + 2} />
    </Sequence>
    {/* Projects shipped: the grid of six */}
    <Sequence from={44} durationInFrames={50}>
      <Section src="shots/sec-projects.png" a={[1.45, 900, 330]} b={[1.3, 960, 480]} dur={50} />
    </Sequence>
    {/* Book a call */}
    <Sequence from={88} durationInFrames={47}>
      <Section src="shots/sec-contact.png" a={[1.8, 800, 470]} b={[1.6, 820, 520]} dur={47} />
    </Sequence>
  </AbsoluteFill>
);

const Endcard: React.FC = () => {
  const f = useCurrentFrame();
  const bg = interpolate(f, [0, 110], [1.12, 1.04], { extrapolateRight: 'clamp' });
  const step = (start: number) =>
    interpolate(f - start, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const [n, sub, cta] = [step(6), step(18), step(32)];
  return (
    <Fade>
      <Still src="shots/room.png" transform={camera(bg, 960, 540)} />
      <AbsoluteFill style={{ background: 'rgba(4,6,10,0.78)' }} />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(46,111,158,0.22), rgba(4,6,10,0) 70%)',
        }}
      />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 164,
            lineHeight: 1.2,
            color: C.text,
            opacity: n,
            filter: `blur(${(1 - n) * 12}px)`,
            transform: `translateY(${(1 - n) * 12}px)`,
          }}
        >
          Shajith Sasikumar
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 32,
            letterSpacing: '0.3em',
            color: C.accent,
            marginTop: 16,
            opacity: sub,
          }}
        >
          AI SYSTEMS THAT KEEP RUNNING
        </div>
        <div style={{ marginTop: 88, opacity: cta, transform: `translateY(${(1 - cta) * 10}px)` }}>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: C.screen }}>Walk in.</div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 38,
              fontWeight: 500,
              color: C.text,
              marginTop: 18,
              padding: '16px 34px',
              border: `1.5px solid ${C.accent}`,
              borderRadius: 999,
              boxShadow: `0 0 36px rgba(95,231,224,0.18)`,
            }}
          >
            shaj2x.github.io/Interactive-Room-Portfolio
          </div>
        </div>
      </AbsoluteFill>
    </Fade>
  );
};

export const LaunchVideo: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.void }}>
      <Sequence durationInFrames={100}>
        <Hook />
      </Sequence>
      <Sequence from={90} durationInFrames={142}>
        <Discovery />
      </Sequence>
      <Sequence from={222} durationInFrames={110}>
        <Click />
      </Sequence>
      <Sequence from={322} durationInFrames={145}>
        <Inside />
      </Sequence>
      <Sequence from={457} durationInFrames={DURATION - 457}>
        <Endcard />
      </Sequence>
    </AbsoluteFill>
  );
};
