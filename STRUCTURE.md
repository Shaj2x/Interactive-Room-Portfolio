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

Canvas renderers follow the same spirit: `shadowBlur` is the most expensive
call in any of them, so it is spent only where it reads — the ball, the snake's
head, the platform the player just hit — and never on every element of a
collection.

## Copy

Game names, kinds and taglines live in `play.games` in `src/content/profile.ts`,
the site's single source of truth for words. `registry.ts` maps each `id` to a
factory and an aspect and reads the rest from there.
