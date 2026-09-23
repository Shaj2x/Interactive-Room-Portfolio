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

## The section sheets

A section is not a dialog box. `SectionShell` draws an editorial sheet anchored
to the right edge of the viewport at `min(1180px, 100%)`, so the room's blurred
plate keeps showing down the left-hand side and the backdrop is graded left to
right rather than radially — you never lose where you are standing.

The sheet is a two-column grid. The rail (`clamp(76px, 7vw, 112px)`) carries the
section number, a hairline, the object you clicked set vertically, and the way
back at its head. The page fills the second column, and from 1080px up any
`<section>` that has an `<h2>` splits again: the heading hangs right-aligned in
a 168px margin column and the prose keeps a 62ch measure beside it. Sections
without a heading — the mastheads — stay full-bleed, which is what makes the
opening of each page read differently from its body.

Everything in here is built from hairlines and type. There are no bordered,
rounded, translucent boxes: stats are divided by rules, project entries are
ruled-off index rows, tags are a mono run separated by middots, and CV dates
hang in their own margin column. If you add a pattern, add it that way.

Four things move, and nothing else:

1. **Open.** The sheet slides 44px from the edge it is anchored to (420ms), the
   title is wiped up from its own baseline with `clip-path` rather than faded
   (480ms at +220ms), the rail's hairline draws down and the masthead rule draws
   across, and the body staggers at 50ms. `clip-path` is the one non-transform
   property worth animating here: it composites, and a fade on display type that
   size reads as something still loading.

2. **Close.** The same two animations played `reverse`, at roughly half the
   time — 220ms for the sheet, 200ms for the backdrop. `SectionShell` holds the
   component for `EXIT_MS` in a `closing` state to let it play, and cancels every
   entrance inside the sheet while it does so nothing replays underneath. Exit
   is deliberately faster than entry: the visitor has already decided to leave.

3. **The back arrow** nudges 3px in the direction it will take you, 150ms.

4. **Project entries and cabinets** brighten their rule under the pointer,
   because they contain links and have to say so. That is the entire hover
   budget for the sheets; nothing else moves on hover.

Under `prefers-reduced-motion` the sheet still announces itself but does not
travel, wipe or draw — everything collapses to a 200-240ms fade, and the exit
delay in `SectionShell` drops to zero so closing is immediate.

The masthead heading is focused on open for screen readers, so its focus ring is
suppressed explicitly; Escape, the rail button and a click on the room are the
real controls, and Tab stays trapped inside while the sheet is up.

## Copy

Game names, kinds and taglines live in `play.games` in `src/content/profile.ts`,
the site's single source of truth for words. `registry.ts` maps each `id` to a
factory and an aspect and reads the rest from there.
