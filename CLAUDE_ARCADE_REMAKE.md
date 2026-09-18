# Claude Code Handoff: Shajith Night Room Portfolio + Arcade Remake

## Objective

Rebuild the existing Shajith Sasikumar portfolio website as a polished, cinematic personal portfolio with a hidden click-and-find room interface and a genuinely playable in-site arcade. The four games must feel intentional and complete rather than like canvas prototypes.

The site is a React 19 + TypeScript + Vite static WebDev project. The current project root is `/home/ubuntu/shajith-night-room`.

Do not replace the room concept with a conventional portfolio dashboard. Preserve the room, hotspot discovery, rainy window, dark editorial atmosphere, and direct section overlays.

## Current product direction

The homepage is a cinematic night study. It contains a desk, bookshelves, a rainy window, and a seated silhouette. Visitors discover clickable hotspots in the scene rather than using a visible navigation bar. The sections are:

- Services: what Shajith builds.
- About: biography and operating philosophy.
- Record: education and work history.
- Work: shipped projects.
- Play: the embedded arcade.
- Contact: email and contact form.

The top navigation tabs were intentionally removed. Do not reintroduce them.

The visual language is dark, cinematic, editorial, and restrained:

- Background: deep blue-black room tones with warm desk light.
- Accents: amber/gold for primary interaction and pale teal for system/live states.
- Display font: Bodoni Moda or a similarly distinctive high-contrast editorial serif.
- Supporting font: Sora or another geometric sans.
- Utility labels: IBM Plex Mono.
- The supplied S-mark logo is already uploaded at `/manus-storage/shajith-logo-transparent_5b92de05.png` and is used in the header and intro screen.
- Do not add generic rounded SaaS cards, bright gradients, visible tab bars, or unrelated dashboard UI.

## Non-negotiable arcade requirements

The Play section must contain four separate games that run entirely inside the site. Do not link to the old external play room. Every game needs a clear start/reset state, an active gameplay state, a scoring or progress model, a game-over/result state, visible instructions, and keyboard plus pointer/touch support where practical.

The game selector may remain a left-side list of four cabinets, but selecting an item must switch the playable game in the adjacent stage. The game stage should animate subtly when switching games. Keep the stage visually integrated with the site: dark glass, thin editorial rules, amber and teal status accents, crisp type, and no game-library-looking chrome.

### 1. Pong — “Night Shift Pong”

Goal: first player to 7 points wins.

Gameplay:

- Player paddle on the left; AI paddle on the right.
- W/S and ArrowUp/ArrowDown control the player paddle.
- Pointer movement over the game stage also controls the paddle.
- On touch, dragging vertically controls the paddle.
- Ball speed increases slightly after successful returns.
- Add a small amount of angle variation based on hit position.
- AI should be beatable but not passive. Add a reaction delay and capped movement speed.
- Scores reset after a point. Match ends at 7.
- Show a center countdown before each serve.
- Provide Pause, Restart, and “Back to games” controls.
- Use a clear end-state overlay: WIN / CLOSE ONE / TRY AGAIN.

Presentation:

- Draw a proper court with center line, service marks, glow trail behind the ball, and restrained particle sparks on paddle contact.
- Keep the court responsive to the available stage size. Use logical coordinates and scale the canvas with device pixel ratio.
- Make the player and AI visually distinct using amber and teal.

### 2. Snake — “Signal Snake”

Goal: collect signal nodes and survive as long as possible.

Gameplay:

- Arrow keys and WASD control movement.
- Swipe gestures work on touch devices.
- The snake wraps around the edges by default; self-collision ends the run.
- Food placement must never spawn inside the snake.
- Speed increases every five nodes.
- Score is based on nodes collected. Show current length and best score for the session.
- Add a short grace period after starting so the player cannot instantly lose.
- Provide Pause, Restart, and result overlay controls.

Presentation:

- Use a visible grid with subtle alternating cells.
- Render the head with an eye or directional notch so movement is obvious.
- Animate a small pulse on the food node and a brief glow on collection.
- Use a readable HUD: SCORE, LENGTH, SPEED.

### 3. Time It — “Quarter Second”

Goal: stop the timer as close as possible to the target time.

Gameplay:

- Generate a target between 2.0 and 6.0 seconds in 0.25-second increments.
- Start button begins the run. Stop button freezes it.
- Spacebar, Enter, click, and tap can stop the timer.
- Score bands:
  - Perfect: within 0.05 seconds.
  - Sharp: within 0.15 seconds.
  - Close: within 0.30 seconds.
  - Missed: anything beyond that.
- Save the best attempt for the session.
- Add a small “streak” counter for consecutive Sharp or Perfect results.
- Include a visual progress sweep around the timer, but do not make the target obvious through the animation.
- Provide Try Again and Reset Best controls.

Presentation:

- Large editorial numerals with a mechanical mono readout for the target.
- The result should have a distinct accent state: amber for Perfect, teal for Sharp, muted warm gray for Missed.
- Add a short result animation that respects reduced-motion preferences.

### 4. Updraft — “Climb the Weather”

Goal: climb as high as possible through an endless vertical route.

Gameplay:

- Spacebar, ArrowUp, click, and tap apply an upward flap impulse.
- Gravity pulls the player down continuously.
- The player automatically moves forward through a horizontally scrolling world.
- Platforms must be procedurally generated with reachable gaps. Do not generate impossible jumps.
- Camera scrolls upward as the player gains height.
- Landing on a platform gives a small bounce and increases height score.
- Missing a platform causes a fall and ends the run.
- Add occasional wind zones that slightly push horizontally. Telegraph them visually before they affect the player.
- Add collectible lightning motes that increase score but are optional.
- Show HEIGHT, BEST, and MOTES.
- Provide Pause, Restart, and end-state overlay controls.

Presentation:

- Use a vertical atmospheric gradient, thin cloud bands, platform glow, and subtle particles.
- Player should have a readable silhouette and an upward motion trail.
- Difficulty should ramp gradually by changing platform spacing and wind frequency.
- The game should remain playable on mobile with one-handed taps.

## Architecture requirements

Keep game logic separate from React rendering as much as practical. Use plain TypeScript classes or modules under `client/src/game/`:

```text
client/src/game/
  arcadeTypes.ts
  input.ts
  gameLoop.ts
  scoreStore.ts
  pong/
    PongGame.ts
    pongRenderer.ts
  snake/
    SnakeGame.ts
    snakeRenderer.ts
  time-it/
    TimeItGame.ts
    timeItRenderer.ts
  updraft/
    UpdraftGame.ts
    updraftRenderer.ts
```

React should own:

- Which game is selected.
- Overlay visibility.
- Pause/restart button state.
- Accessibility labels.
- Session best scores.
- Mounting and disposing each game instance.

Each game should expose a small lifecycle contract similar to:

```ts
export type GameStatus = "ready" | "playing" | "paused" | "won" | "lost" | "result";

export interface EmbeddedGame {
  mount(canvas: HTMLCanvasElement): void;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  destroy(): void;
  handlePointer(event: PointerEvent): void;
}
```

Do not create one giant `useEffect` containing all game rules. Avoid storing gameplay state on the DOM canvas object. Use explicit game instances and deterministic update loops.

## Rendering requirements

- Use a canvas for each game stage or a shared lifecycle-safe canvas component.
- Support device pixel ratio without making the logical coordinate system unstable.
- Handle resize with `ResizeObserver` or a window resize listener.
- Clean up animation frames, pointer listeners, keyboard listeners, and timers on unmount.
- Guard against React StrictMode double mounting.
- Respect `prefers-reduced-motion` by reducing trails, pulses, and screen-shake effects.
- Never allow a canvas to become visually blank while loading. Render a ready state immediately.
- Add `aria-label` and visible control text for every game.

## Input requirements

Centralize input handling. Keyboard shortcuts must not scroll the page while a game is active. Pointer and touch input should use Pointer Events rather than separate mouse and touch implementations. Input listeners must be scoped and removed on cleanup.

Recommended control mapping:

- Pong: W/S, ArrowUp/ArrowDown, pointer Y, touch drag.
- Snake: Arrow keys, WASD, swipe.
- Time It: Space, Enter, click, tap.
- Updraft: Space, ArrowUp, click, tap.

## Audio and sound

Do not autoplay audio. If sound is added, start it only after the user interacts with the game. Reuse the existing rain mute control pattern or add a separate game-sound toggle inside the Play stage. Keep the games playable and understandable when muted.

## Validation checklist

Before handing off:

1. Run `pnpm check`.
2. Run `pnpm build`.
3. Verify `/#play` opens directly without requiring the intro screen.
4. Click each of the four game selectors.
5. Start and reset each game.
6. Confirm keyboard input works.
7. Confirm pointer/touch input works for Pong, Time It, and Updraft.
8. Confirm Snake handles self-collision and food placement.
9. Confirm Pong reaches a visible match result.
10. Confirm Updraft generates reachable platforms and ends cleanly on a fall.
11. Test a narrow mobile viewport.
12. Test with reduced motion enabled.
13. Capture a screenshot of the Play section showing the game selector and active game stage.

## Deliverables

The final implementation should include:

- The rebuilt website in the existing project.
- Four properly playable embedded games.
- `PLAN.md` describing risks and verification criteria.
- `STRUCTURE.md` describing the React/game architecture.
- `ASSETS.md` describing the room artwork, logo asset, and any generated game assets.
- `CLAUDE_ARCADE_REMAKE.md` containing this handoff specification.

## Definition of done

The remake is complete when the four games feel like small finished arcade experiences rather than visual demos. A visitor should understand the objective within five seconds, start playing without leaving the website, receive meaningful feedback from every action, and know how to restart or return to the game selector.

## References

This handoff is based on the existing project structure and the Manus WebDev browser-game implementation guidance. No external research is required for the implementation.
