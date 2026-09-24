# Structure

How the arcade is put together, and where the line between React and the games
sits. For the room, the scene layers and the hotspots, see `README.md`.

## The rule

**React owns the chrome. A game owns everything between frames.**

React decides which game is on screen, what the buttons say, what the HUD
reads, and when a game is created or destroyed. It never runs a game rule and
never touches a pixel. A game never renders a DOM node and never knows React
exists.

The two meet at one interface, `EmbeddedGame` in `src/game/arcadeTypes.ts`.

## Files

```text
src/game/
  arcadeTypes.ts        The EmbeddedGame contract, GameState, Readout
  gameLoop.ts           BaseGame (loop, status, subscriptions), CanvasSurface, letterbox
  input.ts              Pointer + keyboard plumbing, SwipeTracker, key mapping
  scoreStore.ts         Session best scores
  palette.ts            Canvas colours, glow/rounded-rect/particle primitives
  pong/       constants.ts  PongGame.ts  pongRenderer.ts
  snake/      constants.ts  SnakeGame.ts snakeRenderer.ts
  time-it/                  TimeItGame.ts timeItRenderer.ts
  updraft/    constants.ts  UpdraftGame.ts updraftRenderer.ts

src/arcade/
  Arcade.tsx            Cabinet list + the selected stage
  ArcadeStage.tsx       Canvas host: instance lifetime, HUD, overlays, controls
  registry.ts           id → factory, aspect, and copy from profile.ts
  arcade.css            Stage, cabinets, HUD, overlays
```

Each game is three files, and they have distinct jobs:

- `constants.ts` — the geometry and physics numbers, shared by rules and
  renderer so the two can never disagree about where something is.
- `<Name>Game.ts` — the rules. Extends `BaseGame`. Owns a plain `World` object.
- `<name>Renderer.ts` — a pure function of `(ctx, view, world, status)`. It
  reads and never writes, so it is safe to call in any state, including before
  the game has started.

## The lifecycle

```ts
mount(canvas)  // build the world, paint one frame, start the rAF loop
start()        // reset and begin
pause() / resume()
reset()        // back to the opening position, status 'ready'
destroy()      // cancel the frame, disconnect the observer, drop listeners
```

`BaseGame` implements all of it. A game supplies four hooks:

| Hook | Called | Job |
| --- | --- | --- |
| `onReset(ctx)` | mount, reset, start | Put the world back to its opening position |
| `onUpdate(dt, ctx)` | every physics step, only while playing | Advance by exactly `dt` |
| `onRender(ctx, view)` | every frame, in every status | Draw the world |
| `buildState()` | after any `publish()` | Build the snapshot React renders |

### Fixed timestep

Physics advances in fixed 1/120s steps from an accumulator, capped at six steps
per frame. A 144Hz monitor and a throttled background tab therefore produce the
same game, and a tab that was hidden for a minute resumes rather than
fast-forwarding through it.

Rendering is once per frame, decoupled from the step.

### State flows one way

A game mutates its world sixty times a second. Pushing that through React state
would re-render the tree to move a ball, so it does not: the world is a plain
mutable object, and React only hears about it when something *visible to the
chrome* changes. Games call `publish()` at those moments — a point scored, a
node eaten, a flap spent — and `buildState()` produces a whole fresh snapshot.

Whole snapshots rather than diffs, so React can never show a stale half-state.

## Canvas and resize

`CanvasSurface` sizes the bitmap in device pixels and pre-scales the context, so
**games only ever think in CSS pixels**. Changing DPR changes the bitmap and
never the coordinates a game sees.

Three games are authored against a fixed logical playfield and mapped in with
`letterbox()`:

| Game | Logical playfield |
| --- | --- |
| Pong | 1000 × 620 |
| Snake | 952 × 612 (28 × 18 cells of 34) |
| Updraft | 900 × 620, scrolling vertically without limit |
| Quarter Second | none — a centred dial sized from the smaller edge |

The stage takes each game's own aspect ratio (`Cabinet.aspect`, from those same
constants), so a court fills the stage instead of sitting inside letterbox
bands. That mattered most on a phone, where a wide court in a square stage wasted
half the screen.

Resize is handled by `ResizeObserver`, falling back to a window listener.

## Instance lifetime, and StrictMode

`ArcadeStage` creates the game **inside** the mount effect, not in a `useState`
initialiser or a `useMemo`:

```tsx
useEffect(() => {
  const game = cabinet.create();
  gameRef.current = game;
  game.mount(canvas);
  const unsubscribe = game.subscribe(setState);
  const detachInput = attachInput(canvas, { getGame: () => gameRef.current });
  return () => { detachInput(); unsubscribe(); game.destroy(); };
}, [cabinet]);
```

Under StrictMode this effect runs twice. Because the instance is built inside
it, the discarded first run destroys *its own* instance rather than the one left
on screen. `BaseGame.mount` also tears down any previous surface, as a second
line of defence.

The effect depends on `cabinet` alone. A change of motion preference goes
through a separate effect so it cannot tear down a running game.

## Input

All input goes through `attachInput`:

- **Pointer Events only** — one code path for mouse, pen and touch. Non-mouse
  pointers are captured on `pointerdown`, so a drag survives leaving the canvas.
- **Keyboard on `window`**, not the canvas, because players press an arrow key
  the moment a game is on screen rather than clicking it first. It ignores
  events aimed at a text field, and at a focused button or link for Space and
  Enter.
- **Scroll suppression**: while a game's status is `playing` or `paused`, the
  arrow keys and Space are swallowed whether or not the game acts on them —
  pressing Left in Updraft must not scroll the section out from under the
  stage. Once the game is idle the page gets them back.

`getGame` is a callback, looked up per event, so swapping cabinets never leaves
a stale reference behind.

## Motion, and what it costs

Two rules came out of profiling this site, and both are easy to break by
accident:

1. **Nothing animates behind an open section.** The room is frozen
   (`animation-play-state: paused`), the flicker and screen-line intervals stop,
   and once the veil has faded in the live scene stops rendering entirely. If
   you add ambient motion to the room, it must respect `dimmed` the same way.

   Pausing is not always enough. The film grain is `mix-blend-mode: overlay`,
   and a blend-mode element keeps its whole subtree on a blended compositing
   path whatever it is doing — paused or not. Behind an open section there is
   nothing for it to be grain *on* (the room is a 48x27 image stretched to a
   blur), and with a game running on top it was costing 15fps: 45.1 against
   60.3, measured in the Play section. `.room.is-dimmed .grain` takes it off
   the page entirely. Anything else with a blend mode or a filter needs the
   same treatment, not just a pause.

2. **No full-viewport `filter` or `backdrop-filter` on anything that sits over
   moving content.** Both are recomputed every frame the page composites. The
   room's blur is baked into a 48x27 image (`scene/plateVeil.ts`) instead, and
   the arcade's overlays use a plain scrim. `PLAN.md` has the measurements.

3. **To animate a light that is painted into the plate, subtract.** The room's
   lights live in the photograph, so an additive glow on top of a constantly-lit
   strip changes almost nothing — which is why the blooms read as completely
   steady whatever drives them. `platePulses` puts a black rectangle over each
   light instead: at opacity `a` it leaves `(1 - a)` of the picture showing, so
   animating that dims and restores the painted light. Plain alpha, not
   `mix-blend-mode: multiply` — for a black fill the two are identical and one
   of them costs a blend pass.

   The exception is the room's own breath, which has to go *above* the
   photograph as well as below it. Nothing laid on top can do that: black only
   subtracts, and a screen-blended lift raises the shadows rather than the
   lights, which turns the blacks milky. Only a multiply gets it right, so the
   breath is `filter: brightness()` on `.stage` — below 1 it dims, above 1 it
   lifts, and the blacks stay black either way.

   That filter is the one place the room pays for a filter, and it is fenced in
   two ways: it comes off entirely behind an open section (`.room.is-dimmed
   .stage`), because a filter declared on a hidden stage still keeps the
   subtree on a filtered path and was taking nine frames a second from the
   arcade; and reduced motion removes it with the animation.

4. **Rain belongs to the glass, not the window — and must never meet an edge.**
   `plateGlass` holds one rectangle per pane and the rain is clipped to each
   separately; clipping to the window as a whole lets drops fall across the
   mullion and the frame, which reads as rain painted on the picture. But the
   clip alone is not enough: a drop still at full opacity when it crosses the
   clip is cut off on a hard line, and that line is what looks like rain
   running over the frame. The keyframe fades each drop in well below the top
   edge and out well above the bottom one, so nothing is ever severed. Depth
   comes from three bands whose drops differ in speed, length and brightness —
   on a flat plate that difference is the only cue available.

5. **Animate over the scene, not inside it.** Those rectangles began as SVG
   `<rect>`s in the plate group and cost five frames a second, because animating
   anything inside the scene repaints the scene, filters and all. As HTML
   siblings of the `<svg>` they are compositor layers animating only opacity:
   with the film grain off, the room holds 60fps whether the pulses and rain
   are running or not. They carry the plate's `data-depth`, so the parallax
   still moves them with the light.

   (With the grain on it is 45.9fps against 46.7 — the difference is the grain
   re-blending the viewport whenever anything beneath it changes, not the cost
   of the animation. That remains the room's one expensive effect.)

Canvas renderers follow the same spirit: `shadowBlur` is the most expensive
call in any of them, so it is spent only where it reads — the ball, the snake's
head, the platform the player just hit — and never on every element of a
collection.

## Type

Three voices, self-hosted in `src/styles/fonts.css` from files in
`src/assets/fonts/`. Nothing is fetched from Google at load: the page never
waits on a third-party connection before it can set a word, the files are
cached and versioned with the build, and the design is guaranteed to render as
drawn instead of falling back to Georgia on a network nobody controls.

- **Bricolage Grotesque** (`--font-display`) — variable, 200–800 weight and
  75–100% width. Every heading, figure and name. The width axis is the point:
  headings are drawn narrow and heavy from the same file the lede is set from,
  so the hierarchy comes from weight, width and scale rather than from a second
  typeface shouting. Use `font-stretch` alongside `font-weight` — the tokens
  `--w-display` and `--t-display` hold the display defaults.
- **Schibsted Grotesk** (`--font-body`) — a newspaper grotesk for running text.
  Warmer and less mechanical than an interface sans, and built to be read at
  length.
- **Space Mono** (`--font-mono`) — every machine label on the site: chapter
  numbers, eyebrows, dates, tags, the arcade HUD, the room's controls. Its
  slab-ish terminals give the instrument-panel voice. It is wide, so labels
  are tracked at `--t-label` (0.14em) rather than the 0.2em+ the old mono
  wanted, and set a point smaller.

Latin only — everything this site sets, "Résumé" included, lives inside
U+0000–00FF, so the latin-ext subsets were dropped and saved 105kB. If you add
copy in another language, pull that subset back from Google's css2 endpoint and
add the matching `@font-face`.

## Colour, and the three lights

The site is lit by three sources and they are not the same colour.

**The room is the window.** Cold blue night, rain, city glass. Those values
live in `tokens.css` as `--c-void`, `--c-navy`, `--c-screen*` and the blue-grey
`--c-text*`, and they are the photograph's own light — do not warm them.

**The room's furniture is the lamp.** The menu button, the room-tone control,
the signature, the hotspot rims and the intro are warm: `--c-accent` is amber
globally, because the room is lit amber from the left and an amber rim sits on
that photograph as if it belonged to it. The `--w-*` set holds the warm darks.

**A section is paper under that lamp.** Warm cream, dark ink. The `--p-*` set.

The switch happens exactly once per surface, by rebinding the semantic tokens:

```css
.section-backdrop {          /* ink on paper      */
  --c-screen-core: var(--p-ink);
  --c-text-dim: var(--p-ink-soft);
  --c-accent: var(--p-accent);
  /* …and the rest */
}
.arc-stage {                 /* …but the game screen is lit by itself */
  --c-screen-core: var(--w-paper);
  --c-accent: #e8a465;
}
```

Everything inside a surface — its type, its rules, its scrollbars,
`:focus-visible`, `::selection` — reads those through the cascade. **So write
CSS against the semantic `--c-*` tokens, never against a literal.** A
hardcoded `rgba()` is a colour that cannot follow the light, and there are none
left in the section, arcade, chrome or room stylesheets.

The one deliberate exception is `.intro-bloom`, which stays blue: it is the
laptop screen coming on, and that light really is cold.

Every paper value was picked against `--p-paper-lo`, the darkest corner of the
sheet, not against the average — the corner is where a label is hardest to read
and it is the only number worth tuning to. Measured there: titles 12.7:1, body
8.3:1, 10px mono labels 5.1:1, links 4.9:1, numerals 4.6:1. The same exercise
on the warm-dark set gives body 7.7:1 and labels 5.7:1.

The canvases cannot read CSS per frame, so `src/game/palette.ts` mirrors the
warm values by hand; change a colour and change it in both places. The
arcade's grammar is *amber = the player, the second hue = the system*, and both
had to stay warm while staying apart — so the old teal is terracotta
(`#e0745a`), still called `teal` because every renderer names it that. Gold
against clay is far enough in hue and value to read at speed, which is the only
job that pair has.

## The menu is in the room

There is no dropdown. Pressing Menu dims the room and the eight section names
hang on the objects they belong to — the laptop, the bookshelf, the mug — each
on a short leader line, with nothing drawn around them. `scene/PinnedMenu.tsx`.

This works because every object's box is already known in scene coordinates.
The one thing that is not obvious is **where the pins live in the DOM**: not
inside `.stage`.

`.stage` is cover-fitted — `width: max(100vw, 100vh * 16/9)` — so at any aspect
ratio but 16:9 it is wider than the window and its sides are cropped away. A
pin positioned inside it in percentages lands on its object correctly and can
still be off screen, with nothing to clamp against. Measured at 1440x900,
Leadership started at -4px and Résumé ended 45px past the right edge.

So the pins sit outside the stage and repeat the same fit in `calc()`:

```css
--sw: max(100vw, calc(100vh * 16 / 9));
left: clamp(
  var(--gutter),
  calc((100vw - var(--sw)) / 2 + var(--fx) * var(--sw)),
  calc(100vw - var(--gutter))
);
```

`--fx` / `--fy` are the object's centre as a fraction, set inline. No measuring
pass, no resize listener, and the answer is clampable — which is the whole
point. Verified: all eight on screen with no two overlapping, at 1440x900,
1920x1080, 1200x760 and 900x620.

Names in the outer thirds anchor inward (`data-anchor`): one on the left starts
at its object and runs right, one on the right ends at its object and runs
left, and the leader always points back at the thing it names.

Two things that were tried and removed: hand-tuned nudges to separate Play from
Contact — measurement showed the two never collide on their own, and the nudges
were what caused the collision — and a tilt on the hover labels, which a pin
does not have because a pin is not a tag.

A hover label is one pin shown on its own: same name, same leader, no chip. A
chip there would be the one container the rest of this navigation refuses to
draw.

The room freezes behind the menu exactly as it does behind a section
(`.room.is-menu`), including taking the grain off the page rather than pausing
it — see the blend-mode note under **Motion**.

On a narrow screen the trigger is not rendered at all: the room is too small to
read eight names off, and `CompactNav` already lists every section in the open
underneath it. The trigger is also hidden while a section is showing, where it
would open a menu nobody can see.

## Retiring a section

Leadership and community is no longer a section of its own — it is the third
band inside Record, on the bookshelf, with the rest of the history. Folding one
in touches more than the component:

- `SectionId` in `profile.ts` loses the id. The content array stays; it is
  rendered by whichever section now carries it.
- Both hotspot tables (`hotspots.ts` for the SVG room, `plate.ts` for the
  photograph) drop their entry, and **every `order` after it renumbers** —
  those numbers are the tab ring, the pinned menu's 01–07 and the phone list,
  and a gap in them shows up in all three.
- `index` on the remaining `<SectionShell>` calls has to match the new order,
  because that is the number printed in the chapter mark.
- `useHashRoute` keeps a `MOVED` map. A shared or bookmarked `#leadership`
  still opens Record instead of silently landing on the room — a retired hash
  is not a dead one.

## The section sheets

A section is not a dialog box, and it is not a card either. The room drops
away behind it and the type stands on the darkness — the same rule the menu
follows, which is why the cream-paper version was dropped: a sheet is a
container laid over the photograph, and this site's navigation deliberately
does not draw one. It still **grows out of whatever you clicked**.

### Where it comes from

Every control that opens a section reports its own centre in viewport pixels —
`Hotspot`, the menu, the phone's section list, all via `originOf()` in
`scene/openOrigin.ts`. App holds it while the section is open and hands it to
the shell, which writes it as `--ox` / `--oy`. The growing itself is pure CSS:

```css
.paper-stack {
  transform-origin:
    calc(var(--ox, 50vw) - (100vw - 100%) / 2)
    calc(var(--oy, 50vh) - (100vh - 100%) / 2);
}
```

The stack is centred, so its left edge is at `(100vw - width) / 2`, and `100%`
in `transform-origin` resolves against the element's own box — which makes that
a legal value. No layout read, no measuring pass, no frame of the sheet in the
wrong place while JavaScript catches up. `null` origin falls back to dead
centre, which is the honest answer for a deep link or a browser Back: it did
not come from anywhere.

### What moves, and what does not

**The frame scales; the type does not.** Scaling a page of text from 0.3 renders
it blurred for the whole flight, so `.paper-stack` travels alone and the head
band, the page and the title fade in behind it once it has landed. The title is
then wiped up from its own baseline with `clip-path` — it composites, and a
fade on display type that size reads as something still loading.

**The page stays square; only the blank sheet behind it tilts.** Half a degree
of rotation on a column of body text costs crisp glyph rasterisation, so
`.paper-under` carries the whole off-square idea and the sheet you read does
not. The same rule is why the hotspot tags can be tilted and the sheets cannot:
tiny type on a chip has nothing to lose.

**Close is the entrance reversed at roughly half the time** — 260ms, back into
the object it came out of. `SectionShell` holds the component in a `closing`
state to let it play and cancels every entrance inside so nothing replays.

**Back sits top-left at every width.** It is where a way out is looked for, it
puts the control first in the tab order, and it keeps the top-right corner free
for the room's menu button — which the two of them were fighting over on a
phone when the control was on the right.

### Two layout traps worth knowing

`.section-backdrop` uses an explicit `grid-template: minmax(0,1fr) /
minmax(0,1fr)`, not `place-items` on an auto track. With an auto row the grid
measured the sheet's max-content contribution — a percentage height is
indefinite during intrinsic sizing, so the row grew to the full 2774px of the
page inside and centred the sheet 958px below the fold. The definite track also
gives `height: min(920px, 100%)` something real to resolve against.

Headings hang in the margin and the timeline's dates hang beside their entries,
both via `@container` queries on `.paper` — measured against the sheet, which is
not the same thing as the viewport. The title is likewise sized in `cqw`.

### The popups

All four speak the same language:

- **The menu** is the same paper, torn small, revealed by a `clip-path` wipe
  down from its trigger with the lines arriving behind it. A menu that scales
  from 0.96 is the most generic entrance on the web.
- **The hotspot tags** are paper tags pinned to the room a degree off-square,
  with an amber top edge. No `backdrop-filter` — it samples the room underneath
  and forces the whole viewport to be re-read whenever anything moves.
- **The arcade overlays** stay on the screen's own light: a ruled plate, with
  hairlines drawing out from the kicker and the title wiped up like every other
  title on the site.
- **The intro** is the lamp coming on *across* the name rather than a curtain
  lifting off it — a narrow bright band travelling through
  `background-clip: text`. `backgroundPosition` is not a compositor property,
  but this is a one-off 2.6s sequence on two words and the cost never repeats;
  nothing else can light type from a moving source without stacking a second
  copy of the word. The band is deliberately narrow (45%–54% of a 300%-wide
  gradient): the first version ramped over 70% of the word and read as the
  whole name brightening at once rather than an edge you can watch move.

Under `prefers-reduced-motion` every surface still announces itself but nothing
grows, wipes, draws or sweeps — all of it collapses to a 200–240ms fade, the
exit delay drops to zero, and the intro's name is simply lit where it stands.

## Copy

Game names, kinds and taglines live in `play.games` in `src/content/profile.ts`,
the site's single source of truth for words. `registry.ts` maps each `id` to a
factory and an aspect and reads the rest from there.
