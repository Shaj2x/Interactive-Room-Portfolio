# Assets

Everything the site loads, where it comes from, and what is deliberately not a
file.

## Summary

| Asset | Form | Location |
| --- | --- | --- |
| Room artwork | Room photograph, 2000 × 1125 JPEG, 240 kB, one local edit | `src/assets/room-plate.jpg` |
| Room artwork (alternative) | Hand-built SVG, five parallax layers | `src/scene/layers/*.tsx` |
| Arcade artwork | None — drawn at runtime on canvas | `src/game/*/`*Renderer*`.ts` |
| Dimmed-room backdrop | 48 × 27 baked copy of the plate, inline, ~1.1 kB | `src/scene/plateVeil.ts` |
| Favicon | Inline SVG data URI | `index.html` |
| Fonts | Bricolage Grotesque + Schibsted Grotesk + Space Mono, self-hosted | `src/assets/fonts/`, `src/styles/fonts.css` |
| S-mark logo | **Not present.** A monogram stands in. See below. | `src/game/logoMark.ts` |
| Résumé PDF | Served as-is, 34 kB | `public/resume.pdf` |

## Room artwork

The live scene is the plate at `src/assets/room-plate.jpg`, imported by
`src/scene/plate.ts`. Hotspot boxes, the lamp blooms that breathe and the window
rectangle the rain is clipped to are all measured against it in
`plateHotspots`, `plateLights` and `plateGlass`.

**It is never resized, and it is re-encoded only for a deliberate edit.** That
is the rule, and the reason is worth keeping: it was briefly stored downscaled
to 1600 × 900
and re-encoded to WebP at quality 0.86, which took it from 229 kB to 53 kB and
quietly destroyed the detail the picture is carried by. The raindrops on the
window glass smeared into mush and the lettering on the book spines
disappeared. Both survive a single lossy pass badly, and this image had already
been through one.

The plate is also the only thing on the page whose resolution the display can
actually use: the SVG scales it into a 1600 × 900 box, so on a 2× screen a
1600-wide source is being upscaled. Native resolution is not waste here.

If it needs replacing, replace it. Do not compress it.

### The one edit in the picture

The mug on the desk is painted out and a Rubik's cube stands in its place, so
that Play has an object of its own to hang on. Everything else in the frame is
the photograph. The edit covers x 803–906, y 697–808 of the 2000 × 1125 plate;
outside that rectangle the file differs from the original by a mean of 0.27
levels out of 255, which is the cost of the single JPEG pass at quality 0.92
(229 kB → 240 kB) and nothing else.

Two things make it sit in the room rather than on top of it, and both are worth
knowing before anyone touches it:

- **The light is measured, not invented.** The monitor is the only source, and
  on the mug's white ceramic it reads (73, 34, 7) — an illuminant with almost
  no blue in it. Every face of the cube is a sticker albedo multiplied by that
  light, which is why its blue and green squares are nearly black. A saturated
  blue face is the one thing that could not happen in this room, and the first
  attempt, which had one, is exactly what read as pasted on.
- **The hole is filled in three layers**: a lighting field interpolated across
  it by a masked blur (the phone, the book and the cable are all held out of
  the blur, so nothing cold or bright leaks into the wood), a Poisson residual
  that pins that field to the real plate at the seam, and the photograph's own
  high frequencies so the patch is as grainy as its neighbours.

The pipeline that produced it is not in the repository — it was a one-off — but
it is reproducible from this description plus the geometry recorded in
`plate.ts`. If the plate is ever replaced, the cube goes with it: the new
picture will have its own mug, or no mug, and its own light.

**Swapping the artwork is four steps, and the fourth is easy to miss:**

1. Save the new image to the same path, unmodified. Any 16:9 image works; it
   does not need to be 1600 × 900. Measure it against a 1600 × 900 grid, since
   that is the space every coordinate below is written in — for a 2000 × 1125
   image, scene units are image pixels × 0.8.
2. Re-measure `plateHotspots`, `plateLights` and `plateGlass` in
   `src/scene/plate.ts`. **These are per-image.** Swapping the picture without
   redoing them leaves every hotspot floating over the wrong object and the
   rain falling through a wall.
3. Regenerate `src/scene/plateVeil.ts` — the 48 × 27 baked backdrop shown
   behind open sections. It is a copy of *this* plate; leave it and the room
   behind a section will be the previous room. Its own file documents how, and
   the grade needs checking against the new image: a darker picture needs a
   higher `brightness()` to stay visible behind the panel at all.
4. Check the result with the boxes drawn on. Hovering each object and seeing
   the rim land on it is the only reliable test — the coordinates look fine in
   a diff whether they are right or wrong.

Nothing else downstream — the parallax, the portrait reframing, the menus, the
keyboard order — needs to change. `README.md` has the same procedure in place.

The hand-built SVG room is still in the tree as the alternative art path and
takes over automatically if `plateSrc` is null or `plateHotspots` is empty.

## Arcade artwork

**There are no game assets.** No sprite sheets, no textures, no audio files.
Every one of the four games is drawn procedurally with Canvas 2D from the shared
primitives in `src/game/palette.ts` — rounded rectangles, coloured glow,
particle bursts and a mono label helper.

That is a decision, not an omission:

- It keeps the games the same weight as the rest of the site. The whole arcade
  adds about 39 kB to the JS bundle and nothing to the asset payload.
- A drawn ball can take its colour from a CSS token. A sprite cannot, so the
  palette could drift away from the room's.
- There is no loading state to design, and so no moment where a canvas is blank.

`palette.ts` mirrors the values in `src/styles/tokens.css`, because the canvas
cannot read CSS custom properties cheaply per frame. **If a token changes, it
must be changed in both places.** The pairs that matter:

| Role | Token | Canvas |
| --- | --- | --- |
| Player, and anything the player drives | `--c-amber` | `PALETTE.amber` |
| System, opponent, live state | `--c-accent` | `PALETTE.teal` |
| Ball, lit edges, bright type | `--c-screen-core` | `PALETTE.screenCore` |
| Stage base | `--c-void` | `PALETTE.void` |

## Fonts

| Role | Family | Loaded from |
| --- | --- | --- |
| Display | Instrument Serif | Google Fonts |
| Body | Inter | Google Fonts |
| Utility / mono | System mono stack (`ui-monospace`, SF Mono, Menlo, Consolas) | none — no request |

**Deviation from the handoff, stated plainly.** The handoff asks for Bodoni
Moda, Sora and IBM Plex Mono. The site was already built on Instrument Serif and
Inter, which the handoff explicitly permits ("Bodoni Moda *or a similarly
distinctive high-contrast editorial serif*"), and changing them would have
restyled every existing section for no gain. The mono is a system stack rather
than IBM Plex Mono, which saves a font request; the arcade's utility labels use
it through `--font-mono` and `FONT_MONO`, so swapping in IBM Plex Mono later is
a two-line change.

The canvas renderers name these families directly in `palette.ts`, with the same
fallback chains as the CSS.

## Assets referenced by the handoff that are not here

Both are called for by the spec and neither was available to this build. Each is
wired so that adding the file is the only step required.

### The S-mark logo

The handoff points at `/manus-storage/shajith-logo-transparent_5b92de05.png`.
That path belongs to the previous hosting environment and the file is not in
this repository, so **the header and intro use the wordmark rather than the
S-mark.** The header currently renders `identity.name` as type (`Signature` in
`src/components/Chrome.tsx`).

Updraft flies the mark as its player, so it needs one either way. Until the
real file arrives, `src/game/logoMark.ts` draws a monogram — a warm token with
an S set in Bricolage — and everything downstream asks only for "a square of
this size". It is a stand-in, and it is the only thing on the site pretending
to be the logo.

To add the real one: drop the PNG into `src/assets/` and set `LOGO_SRC` in
`logoMark.ts` to its import. That file documents both options and why the
default is `null` rather than a speculative path — a missing file at a guessed
URL would 404 on every run and cost a round trip before falling back anyway.
For the header and intro, `public/` and
`${import.meta.env.BASE_URL}shajith-logo.png` still apply, so the filename
stays stable there.

### The résumé PDF

`resumeUrl` in `src/content/profile.ts` is `null`, and the Résumé section shows
live links instead of a dead download button. Drop `resume.pdf` into `public/`
and set `resumeUrl` to `` `${import.meta.env.BASE_URL}resume.pdf` `` to turn the
download on.

## Favicon

An inline SVG data URI in `index.html` — a rounded dark square with a lit
laptop. No file, no extra request.

## Typefaces

`src/assets/fonts/` holds four woff2 files, served by `src/styles/fonts.css`.
They are latin-subset builds pulled from Google's css2 endpoint and committed,
not fetched at runtime — see the "Type" section of STRUCTURE.md for why and for
which face does what.

| File | Family | Axes |
| --- | --- | --- |
| `bricolage-latin.woff2` | Bricolage Grotesque | wght 200–800, wdth 75–100% |
| `schibsted-latin.woff2` | Schibsted Grotesk | wght 400–700 |
| `spacemono-latin-400.woff2` | Space Mono | 400 |
| `spacemono-latin-700.woff2` | Space Mono | 700 |

All four are SIL Open Font License 1.1, which permits bundling and
redistribution. To refresh one, request the family from
`https://fonts.googleapis.com/css2?family=…` with a browser User-Agent (the
endpoint serves woff2 only to browsers), take the `/* latin */` block's URL,
and replace the file in place — the `unicode-range` in `fonts.css` is already
the latin one and does not need to change.
