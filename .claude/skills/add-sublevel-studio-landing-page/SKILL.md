---
name: add-sublevel-studio-landing-page
description: "Build sublevel.studio from its verified authored source using Full HTML + DOM/CSS + Three.js 0.160 + inlined media, including the complete renderer, interactions, and required assets. Use when Codex needs to implement, port, or adapt this effect without requiring the ThreeUI package or reconstructing the visual from an approximation."
---

# Build sublevel.studio

## Description

A digital studio and brand workshop presented as a tactile black-and-white operating system: modular project cells, a floating utility dock, service diagnostics, team profiles, lab experiments, and a terminal-like contact close.

Recreate the authored behavior from the verified source, not from screenshots or the abbreviated orchestration sample in this skill. The implementation may live directly in the target project and does not require `@designcodeio/threeui`.

## Technologies

- React iframe host
- Byte-exact complete authored HTML document
- Same-project local source URL
- Embedded project imagery, SVG artwork, textures, and scene data plus the authored Geist, Inter, Inter Tight, Three.js 0.160, and GLTFLoader URLs

## Verified source material

- `src/shaders/landing-pages/LandingPages.tsx`
- `public/landing-pages/sublevel-studio.html — complete page with a full-viewport responsive lobby`

Source revision: `SHA-256 91db5c1bb779`

## Implementation steps

1. Open every verified source file listed above and identify the renderer, host lifecycle, styles, and assets before editing.
2. Copy the complete sublevel.studio HTML file byte-for-byte to /landing-pages/sublevel-studio.html; do not extract, rewrite, shorten, or rebrand any section.
3. Preserve every embedded style, script, media payload, text string, interaction, responsive rule, and document-level lifecycle.
4. Keep every relative local asset at the exact path expected by the original document.
5. Load the local document in a full-size iframe whose permissions retain the authored forms, modals, downloads, popups, scripts, and same-origin resources.
6. Lazy-load only the React host bundle; do not import the complete HTML into the application JavaScript graph.
7. Give the local component a sized, overflow-controlled parent and verify desktop, mobile, reduced-motion, and context-loss behavior.

Asset handling: Copy sublevel-studio.html byte-for-byte; its project imagery, SVG artwork, textures, and scene data remain embedded. Geist, Inter, Inter Tight, Three.js 0.160, and GLTFLoader retain their authored remote URLs, so the page needs network access.

## Local component example

Import the copied local component rather than a package entrypoint:

```tsx
import { SublevelStudioLandingPage } from "./effects/sublevel-studio-landing-page/SublevelStudioLandingPage";
import "./effects/sublevel-studio-landing-page/styles.css";

export function Scene() {
  return <div className="effect-frame"><SublevelStudioLandingPage /></div>;
}
```

## Core renderer pattern

This excerpt documents orchestration only. Copy the exact shader, geometry, pass, and interaction code from the verified source files.

```tsx
<LandingPageFrame title="sublevel.studio" sourceUrl="/landing-pages/sublevel-studio.html" />
```

## Behavior contract

- Runtime: Full HTML + DOM/CSS + Three.js 0.160 + inlined media
- Passes: 1 sandboxed Three.js product renderer layered with DOM, SVG, canvas, embedded project imagery, and system-interface effects
- Interaction: Primary CTA and menu hovers, utility dock and navigation, section-by-section scroll, pointer-reactive 3D object, project cells, service modules, studio lab, and responsive layout
- Assets: Project imagery, SVG artwork, textures, and the authored scene data are embedded in the single document; Geist, Inter, Inter Tight, Three.js 0.160, and GLTFLoader retain their authored remote URLs
- **document** (adapted): Complete owner-supplied sublevel-studio.html with its responsive lobby raised from 80svh to 100svh
- **sourceUrl** (fixed): /landing-pages/sublevel-studio.html
- **layout** (responsive): Original full digital-studio landing page inside the preview frame
- **interaction** (original): CTA and menu hover + navigation + section scroll + pointer-reactive 3D and project modules
- **assets** (embedded + remote runtimes): Embedded project media and scene data plus authored font and Three.js 0.160 URLs

## Verification

1. Compare the rendered composition, animation timing, pointer behavior, and state transitions with the source implementation.
2. Exercise resize, high-DPI, mobile/coarse-pointer, reduced-motion, tab visibility, and WebGL context-loss paths where applicable.
3. Confirm every animation frame, observer, listener, geometry, buffer, texture, framebuffer, material, and renderer is released on teardown.
4. Check the browser console and confirm the effect renders at native-or-better backing resolution.

## Guardrails

- Do not substitute a visually similar package, demo, shader, or runtime.
- Do not approximate, reconstruct, or simplify the authored GLSL, render passes, geometry, interaction state, or assets.
- Keep exact source and asset hashes under regression tests when the source project provides them.
- Adapt only the surrounding host boundary needed by the target project; keep renderer behavior intact.
