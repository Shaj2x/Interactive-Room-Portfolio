# Assets

Everything the site loads, where it comes from, and what is deliberately not a
file.

## Summary

| Asset | Form | Location |
| --- | --- | --- |
| Room artwork | Painted plate, 1600 × 900 WebP, 51.8 kB | `src/assets/room-plate.webp` |
| Room artwork (alternative) | Hand-built SVG, five parallax layers | `src/scene/layers/*.tsx` |
| Arcade artwork | None — drawn at runtime on canvas | `src/game/*/`*Renderer*`.ts` |
| Favicon | Inline SVG data URI | `index.html` |
| Fonts | Instrument Serif + Inter, Google Fonts | `index.html` |
| S-mark logo | **Not present.** See below. | — |
| Résumé PDF | **Not present.** See below. | — |

## Room artwork

The live scene is the painted plate at `src/assets/room-plate.webp`, imported by
`src/scene/plate.ts`. Hotspot boxes, the lamp blooms that breathe and the window
rectangle the rain is clipped to are all measured against that image in
`plateHotspots`, `plateLights` and `plateWindow`.

Swapping the artwork means resizing the new image to 1600 × 900, saving it to
the same path, and re-measuring those three lists. Nothing downstream — the
parallax, the portrait reframing, the menus, the keyboard order — needs to
change. `README.md` has the full procedure.

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

To add it: drop the PNG into `public/`, then reference it as
`${import.meta.env.BASE_URL}shajith-logo.png` in `Signature` and `Intro`. Keep
it in `public/` rather than `src/assets/` so the filename stays stable.

### The résumé PDF

`resumeUrl` in `src/content/profile.ts` is `null`, and the Résumé section shows
live links instead of a dead download button. Drop `resume.pdf` into `public/`
and set `resumeUrl` to `` `${import.meta.env.BASE_URL}resume.pdf` `` to turn the
download on.

## Favicon

An inline SVG data URI in `index.html` — a rounded dark square with a lit
laptop. No file, no extra request.
