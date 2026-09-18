# Plan, risks and verification

What the arcade rebuild set out to do, what is genuinely risky about it, and how
each risk was checked rather than assumed.

## Scope

The room, the hotspot discovery, the rainy window and the section overlays were
already built and were kept. The gap was the Play section: it described four
games and linked out to another site. It now contains the four games, running
inside the page.

The top navigation tabs were not reintroduced. No dashboard UI, gradients or
rounded SaaS cards were added.

## Risks, and what was done about them

### A canvas that is blank, stale, or doubled

The classic failure of a canvas inside React: the effect runs twice under
StrictMode, two loops draw to one canvas, and cleanup destroys the live
instance instead of the dead one.

- The instance is created inside the mount effect, so each run owns and destroys
  its own. `BaseGame.mount` also tears down a previous surface.
- `mount()` paints one frame immediately, so a canvas is never blank while it
  waits to be started.
- **Checked:** every cabinet is sampled before Start — the canvas has to be
  drawn already — and sampled twice after Start to prove it is advancing.

### Physics that depends on frame rate

Fixed 1/120s steps from an accumulator, capped at six per frame, with the frame
delta clamped to 0.25s so a backgrounded tab resumes instead of fast-forwarding.

### Updraft generating impossible jumps

The real risk in a procedural climber. Generation does not place platforms and
hope: each vertical gap is kept under a single bounce's rise
(`v²/2g`), the flight time for that gap is solved from the projectile equation,
and the next platform is placed where the constant forward drift actually
carries the player in that time — with the wind at the destination altitude
folded in, so a gust cannot make a gap unreachable.

- **Checked:** 350+ generated platforms per run, asserting that no vertical gap
  exceeds the bounce rise and that every platform is horizontally catchable from
  the one below, with 100 u/s of wind drift allowed for. Worst observed gap
  158.8 against a 169.0 ceiling.

### Snake spawning food inside itself

Free cells are enumerated and one is picked uniformly, rather than
rejection-sampled, so a nearly full board still terminates.

- **Checked:** 800 spawns against a snake filling 336 of 504 cells, zero
  collisions.

### Quarter Second being readable rather than judged

If the sweep runs at a fixed speed, a player can count it and the game stops
being about judging time. The sweep period is re-rolled every run (3.1–5.3s),
and the elapsed clock is masked while running.

Timing uses `performance.now()` directly, not the stepped accumulator: a
keypress is handled the instant it arrives, and grading it against a stepped
clock would quantise the result to 8ms — a quarter of the Perfect band.

### Keyboard stealing the page, or the page stealing the keyboard

Arrow keys and Space are swallowed only while a game is `playing` or `paused`.
Idle games hand them back so a visitor can still scroll the section.

- **Checked:** the panel's scroll position is recorded before and after pressing
  every arrow key and Space, on all four games.

## What was found and fixed during verification

These were real defects the checks caught, not hypotheticals:

1. **Quarter Second never ran.** `TimeItGame.start()` reset the world, set
   `startedAt`, then called `super.start()` — which reset the world *again* and
   zeroed `startedAt`. The clock stayed at zero and the sweep never moved. The
   randomisation moved into `onReset`, where the base class already calls it.
2. **Arrow keys scrolled the panel** under Updraft and Quarter Second, because
   only keys a game acted on were being suppressed.
3. **Every first run claimed a record.** `submitScore` ran before `buildState`,
   so a run always tied its own freshly stored score and reported itself as a
   best. The previous best is now read before the new score is stored.
4. **Updraft credited 3m for standing still**, because height was measured from
   `y = 0` while the player starts one body above the opening ledger. It is now
   measured from the start line, so an instant fall reads 0m.
5. **`.stage` collided with the room's own class.** The arcade's stage was
   inheriting `position: absolute` from `scene/room.css` and covering the whole
   viewport, swallowing clicks on the cabinet list. Every arcade class is now
   namespaced `arc-`.
6. **The compact section list covered open panels on a phone** (`z-index` 46
   against the backdrop's 40) — pre-existing, affecting every section, and it
   made the arcade unplayable on mobile. The backdrop moved to 48, still below
   the menu button at 50.

## Verification

Two suites, both driving a real browser (Chromium via Playwright) against the
dev server. They are development tooling and are not part of the shipped app.

**Rule checks (12)** import the game modules directly and drive instances with
no UI involved: Snake food placement, self-collision and wrapping; Updraft gap
reachability and clean fall-out; Quarter Second band grading, target
distribution and streak behaviour; Pong match completion both ways and paddle
return.

**UI checks (40)** drive the actual page: `#play` opening without the intro,
four cabinets, stage swap per cabinet, canvas painted before start, canvas
advancing after start, keys not scrolling, pointer input, restart, pause/resume
freezing the world, Quarter Second correctly hiding pause, a 390px viewport with
no horizontal overflow, a touch tap flapping in Updraft, and all four games
rendering under `prefers-reduced-motion`.

Both suites pass in full.

`docs/play-section.png` is the Play section as it ships: the cabinet list on the
left, Night Shift Pong live on the stage, counting down to serve.

### Build

```
npm run build     # tsc -b && vite build — clean
```

TypeScript runs `strict`, `noUnusedLocals` and `noUnusedParameters`.

> **Known gap, pre-existing:** `npm run lint` does not work. `package.json`
> declares an `eslint .` script, but eslint is not a dependency and there is no
> config. It was already broken and was left alone rather than quietly widening
> this change.

## Deliberate decisions worth knowing

- **Updraft has limited lift.** The spec asks for a flap impulse *and* for a
  missed platform to end the run. Unlimited flapping makes those contradictory —
  you could hover forever. Flaps are therefore a resource: two, refilled on
  every landing, shown in the HUD as `LIFT`. Bounces are the lift; flaps are the
  correction.
- **Session bests are in memory**, not `localStorage`. The spec asks for a
  session best, and a score persisted on a shared machine raises the question of
  whose it is. They survive switching games and closing the section, not a
  reload.
- **The games are silent.** The spec forbids autoplay and makes sound optional;
  nothing here needs it to be understood. The room-tone toggle is untouched.
- **Reduced motion means fewer effects, not none.** Trails, particles, pulses
  and the result animation come off. The games stay fully playable, and are
  checked that way.
