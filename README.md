# Interactive Room Portfolio

A single-page portfolio for **Shajith Sasikumar**. The homepage is a dimly lit
room at night, shown from a fixed cinematic angle. Ordinary objects in it are
secretly interactive: hover reveals them, clicking moves into a section.

- Stack: React 18 + Vite + TypeScript, GSAP for the intro timeline.
- The room is a **painted plate** — `src/assets/room-plate.webp`, 1600x900,
  52 kB — with the light and weather rebuilt as animated overlays on top of it:
  rain on its window, blooms that breathe on its laptop, lamp and door strip,
  drifting dust, grain and vignette.
- A hand-built **SVG room** is still in `scene/layers/*` as the alternative art
  path. Set `plateSrc` to `null` in `src/scene/plate.ts` and it renders instead.
- Ambient motion runs on CSS keyframes (off the main thread); only the
  pointer-following parallax uses `requestAnimationFrame`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
```

---

## Companion documents

| Document | What is in it |
| --- | --- |
| `STRUCTURE.md` | The arcade's architecture — where React stops and a game starts |
| `PLAN.md` | Risks, what verification found, and the decisions worth knowing |
| `ASSETS.md` | Room artwork, fonts, and the two assets the spec calls for that are not here |
| `CLAUDE_ARCADE_REMAKE.md` | The original handoff specification, unedited |

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
| `play`, `toolkit` | **Play** (the mug) — `play.games` also names the arcade cabinets |
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

### Swapping the plate

The plate is exactly **1600 x 900**, the same as the scene's viewBox, so image
pixels map 1:1 onto scene coordinates: whatever you measure in the picture is
the number you write in `src/scene/plate.ts`. To swap the artwork:

1. Save the new image as `src/assets/room-plate.jpg`, unmodified — any 16:9
   image works, and it should not be resized or recompressed (see `ASSETS.md`
   for why). Measure it against a 1600 x 900 grid.
2. Measure the objects in it and update `plateHotspots` — each box is x, y,
   width, height in image pixels.
3. Update `plateLights` (the blooms that breathe) and `plateGlass` (the panes the
   animated rain is clipped to, one rectangle each) the same way.
4. Regenerate `src/scene/plateVeil.ts`, the baked backdrop shown behind open
   sections — it is a shrunk copy of the plate and will otherwise still show
   the old room. See `ASSETS.md`, which spells the whole swap out.

Nothing else needs to change: the parallax, the portrait reframing, the
sections and the menus all read from those coordinates.

### The SVG art path

The alternative scene is an SVG with a `0 0 1600 900` viewBox, split into five
layers that parallax independently:

| File | Layer | Depth | Contains |
| --- | --- | --- | --- |
| `scene/layers/WallLayer.tsx` | Wall | 0.15 | Corkboard, sticky notes, framed print, window and city, door |
| `scene/layers/FurnitureLayer.tsx` | Furniture | 0.35 | Floor, bookshelf, desk, chair, bed, low shelf |
| `scene/layers/CandleLayer.tsx` | Furniture | 0.35 | Two candles |
| `scene/layers/DesktopLayer.tsx` | Desk objects | 0.55 | Laptop, mug, phone, lamp |
| `scene/layers/PersonLayer.tsx` | Person | 0.85 | The seated silhouette |
| `scene/layers/ForegroundLayer.tsx` | Foreground | 1.3 | Dust, blurred near edges |

**Lighting hierarchy**, which every surface follows and `SceneDefs.tsx` defines:

| | Source | Colour |
| --- | --- | --- |
| Key | The laptop | Warm cream to amber. The brightest thing in the frame. |
| Warm | Candles, the strip under the door | Same family as key. |
| Cool | The phone, the window | The only cool light — the contrast that stops the warm reading as a sepia wash. |
| Accent | Interactive glow only | Cyan. Never decorative. |

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

## 3. Performance notes

SVG filters are the expensive part of this scene, and a few rules keep them
affordable:

- **Every filter sets `color-interpolation-filters="sRGB"`.** SVG defaults to
  linearRGB, which converts the whole filter region into linear space and back
  on every pass, for no visible benefit here.
- **Never animate `transform` on a filtered element.** It forces the filter to
  be recomputed each frame. Animate `opacity` instead — it is applied after
  filtering. The blooms used to scale; that alone cost about 6fps.
- **Static texture does not belong in an SVG filter** if it sits inside a layer
  the parallax transforms. The wall's plaster was a full-screen turbulence
  filter being re-rasterised every frame; it is now `<WallTexture>`, a plain
  element with a static background image, rasterised once and thereafter only
  composited.
- **Keep filter regions tight.** A filter costs roughly its area.
- On portrait screens the painterly displacement is switched off
  (`.paintable { filter: none }`): the room renders about 220px tall there, so
  the detail is invisible while costing exactly as much.
- **The page measures itself.** `hooks/useQualityGuard.ts` samples real frame
  times once, shortly after the room settles, and drops to the lite path
  (`.room.is-lite`) below 38fps. Screen size tells you nothing about rendering
  power, so this measures instead of guessing. The lite path keeps the
  composition, the lighting and every animation — it only sheds the filters
  that cost the most and add the least at speed.

Note that the measurements behind these choices were taken in a headless
browser with **no GPU** (SwiftShader, software rasterisation). Blur and blend
are precisely what a GPU accelerates, so the absolute frame rates there are a
worst case rather than a prediction. Worth a look on a real low-end phone
before launch.

## 4. Behaviour worth knowing

- **Intro** — about 2.6 seconds, and any click or keypress skips it. Arriving on
  a deep link (`#projects`) skips it entirely.
- **Easter egg** — clicking the desk lamp turns it off; the candles and every
  warm light go out with it and the room falls back to screen-blue alone. The
  laptop screen cycles `screenLines`.
- **Candles and flicker** — three candles (`scene/layers/CandleLayer.tsx`) light
  the room warm. Their flame *shape* loops on CSS keyframes with durations that
  share no common multiple, so the three never sync into a visible beat; their
  *brightness* is driven by `hooks/useWarmFlicker.ts`, which is genuinely
  random — irregular intervals, occasional deeper "gust" dips. Any element
  marked `data-warm="<base opacity>"` joins the flicker, with
  `data-warm-swing` setting how far it is allowed to move.
- **Rain** — falling drops seen through the glass, plus drops that cling to the
  window and then break and run down it.
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

## 5. Deploying

`vite.config.ts` defaults `base` to `/Interactive-Room-Portfolio/` for GitHub
Pages project hosting. The included workflow
(`.github/workflows/deploy.yml`) builds and publishes on every push to the
development branch — enable Pages for the repository with **Source: GitHub
Actions** and it runs.

For a domain root instead, build with `BASE_PATH=/ npm run build` and update
the canonical and `og:url` tags in `index.html`.
