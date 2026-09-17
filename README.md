# Interactive Room Portfolio

A single-page portfolio for **Shajith Sasikumar**. The homepage is a dimly lit
room at night, shown from a fixed cinematic angle. Ordinary objects in it are
secretly interactive: hover reveals them, clicking moves into a section.

- Stack: React 18 + Vite + TypeScript, GSAP for the intro timeline.
- The room is **layered SVG and CSS**, not bitmaps — nothing to download, sharp
  at any resolution, and every light source is a value you can tune.
- Ambient motion runs on CSS keyframes (off the main thread); only the
  pointer-following parallax uses `requestAnimationFrame`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
```

---

## 1. Editing the content

**`src/content/profile.ts` is the only file you need to touch to change words.**

Every string the site renders comes from it — the hero line, the services, the
work history, the projects, the FAQ, the games. Nothing is hardcoded in a
component. Edit the file, save, and the section updates.

The exports map to sections like this:

| Export in `profile.ts` | Where it appears |
| --- | --- |
| `identity` | Signature, intro, page titles, `About`, `Résumé` |
| `about` | **About** (the corkboard) |
| `problem`, `services`, `engagement`, `faq` | **What I build** (the laptop) |
| `education`, `work` | **Record** (the bookshelf) |
| `leadership` | **Leadership** (the sticky notes) |
| `projects` | **Projects** (the poster) |
| `play`, `toolkit` | **Play** (the mug) |
| `contact` | **Contact** (the phone) |
| `resumeUrl` | **Résumé** (the door) |
| `screenLines` | The lines that cycle on the laptop screen |

### Turning on the résumé download

`resumeUrl` is `null` right now, because the PDF does not exist yet. While it is
null the Résumé section shows the live links instead of a dead button. To switch
the download on:

1. Put the file at `public/resume.pdf`.
2. In `profile.ts`, set:
   ```ts
   export const resumeUrl: string | null = `${import.meta.env.BASE_URL}resume.pdf`;
   ```

### Adding or removing a section

1. Add the id to the `SectionId` union in `profile.ts`.
2. Add an entry to `HOTSPOTS` in `src/scene/hotspots.ts` — the object's box in
   scene coordinates, its label, and the `depth` of the layer it is drawn on.
3. Add a component to `src/sections/Sections.tsx` and register it in `REGISTRY`.

The plain menu, the portrait list, the keyboard order and the URL hash all read
from `HOTSPOTS`, so there is nothing else to keep in sync.

---

## 2. Editing or replacing the artwork

The scene is an SVG with a `0 0 1600 900` viewBox, split into five layers that
parallax independently:

| File | Layer | Depth | Contains |
| --- | --- | --- | --- |
| `scene/layers/WallLayer.tsx` | Wall | 0.15 | Window, corkboard, poster, sticky notes, door |
| `scene/layers/FurnitureLayer.tsx` | Furniture | 0.35 | Bookshelf, desk, chair |
| `scene/layers/DesktopLayer.tsx` | Desk objects | 0.55 | Lamp, mug, laptop, phone |
| `scene/layers/PersonLayer.tsx` | Person | 0.85 | The seated silhouette |
| `scene/layers/ForegroundLayer.tsx` | Foreground | 1.3 | Dust, blurred near edges |

Higher depth = nearer the camera = moves more. The depths live in one place,
`DEPTH` in `scene/hotspots.ts`.

- **All light and colour** is in `scene/SceneDefs.tsx` (gradients and filters)
  and `styles/tokens.css` (the palette). Changing `--c-accent` recolours every
  interactive glow on the site and nothing else.
- **To swap in drawn or generated artwork**, replace a layer component's body
  with `<image href="/art/wall.png" width="1600" height="900" />`, keeping the
  same viewBox coordinates. The parallax, hotspots and lighting keep working,
  because they only depend on the coordinate space.
- **If you move an object, move its hotspot too.** `HOTSPOTS` holds a box in the
  same `1600 x 900` coordinates; the buttons are positioned as percentages of a
  stage locked to the scene's 16:9, so a viewBox coordinate always lands on the
  right pixel.

---

## 3. Behaviour worth knowing

- **Intro** — about 2.6 seconds, and any click or keypress skips it. Arriving on
  a deep link (`#projects`) skips it entirely.
- **Easter egg** — clicking the desk lamp turns it off and the room falls
  further into shadow. The laptop screen cycles `screenLines`.
- **Room tone** — soft rain and a distant hum, synthesised with the Web Audio
  API rather than shipped as an audio file. Off by default, toggled bottom-left.
- **Portrait screens** — the room is fitted rather than cropped so nothing is
  lost, and only the objects large enough to be honest tap targets stay
  clickable. Everything else is in the list below the room.
- **Accessibility** — every hotspot is a real focusable button with a
  descriptive name; there is a plain menu that does not require finding a mug;
  sections are dialogs that trap focus, close on Escape and honour the browser
  back button; `prefers-reduced-motion` stops the drift, flicker, parallax and
  intro while keeping the cross-fades that explain where content came from.

---

## 4. Deploying

`vite.config.ts` defaults `base` to `/Interactive-Room-Portfolio/` for GitHub
Pages project hosting. The included workflow
(`.github/workflows/deploy.yml`) builds and publishes on every push to the
development branch — enable Pages for the repository with **Source: GitHub
Actions** and it runs.

For a domain root instead, build with `BASE_PATH=/ npm run build` and update
the canonical and `og:url` tags in `index.html`.
