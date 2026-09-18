import type { GameContext, GameState } from '../arcadeTypes';
import { BaseGame, letterbox } from '../gameLoop';
import { isActionKey } from '../input';
import { PALETTE, spawnBurst, stepParticles, type Particle } from '../palette';
import { submitScore } from '../scoreStore';
import { BALL_R, COURT_H, COURT_W, INSET, PADDLE_H, PADDLE_W } from './constants';
import { renderPong } from './pongRenderer';

/**
 * The court is a fixed 1000x620 logical rectangle mapped into whatever space
 * the stage has. Every number below is in those units, so the game plays
 * identically on a phone and a 4K monitor.
 */

const TARGET_SCORE = 7;
const SERVE_DELAY = 2.1;
const BALL_SPEED_START = 430;
const BALL_SPEED_MAX = 880;
/** Compounded on every successful return. */
const BALL_SPEED_GAIN = 1.045;
/** Steepest angle a return can leave at: 52 degrees off the horizontal. */
const MAX_BOUNCE = (52 * Math.PI) / 180;

const PLAYER_SPEED = 620;
/** Capped below the player's, so the AI can be outrun rather than outguessed. */
const AI_SPEED = 395;

export interface PongWorld {
  playerY: number;
  aiY: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  playerScore: number;
  aiScore: number;
  /** Seconds until the ball is released. Zero means it is in play. */
  serveIn: number;
  trail: Array<{ x: number; y: number }>;
  particles: Particle[];
  /** Fades the last-hit paddle's rim light. */
  playerFlash: number;
  aiFlash: number;
}

export class PongGame extends BaseGame {
  readonly title = 'Night Shift Pong';
  readonly objective = 'First to seven points takes the match.';
  readonly controls = 'W / S or ↑ / ↓ · move the pointer · drag on touch';

  private world: PongWorld = PongGame.emptyWorld();

  /** -1 up, 1 down, 0 still. Set by the keyboard only. */
  private keyAxis = 0;
  private keyUp = false;
  private keyDown = false;
  /** Where the pointer last asked the paddle to be, in court units. Null when unused. */
  private pointerTarget: number | null = null;
  private pointerDragging = false;

  private aiTarget = COURT_H / 2;
  private aiThink = 0;
  private serveDirection = 1;

  private static emptyWorld(): PongWorld {
    return {
      playerY: COURT_H / 2,
      aiY: COURT_H / 2,
      ballX: COURT_W / 2,
      ballY: COURT_H / 2,
      ballVX: 0,
      ballVY: 0,
      playerScore: 0,
      aiScore: 0,
      serveIn: SERVE_DELAY,
      trail: [],
      particles: [],
      playerFlash: 0,
      aiFlash: 0,
    };
  }

  /* ---------------------------------------------------------- lifecycle */

  protected onReset(): void {
    this.world = PongGame.emptyWorld();
    this.keyAxis = 0;
    this.keyUp = false;
    this.keyDown = false;
    this.pointerTarget = null;
    this.pointerDragging = false;
    this.aiTarget = COURT_H / 2;
    this.aiThink = 0;
    this.serveDirection = Math.random() < 0.5 ? -1 : 1;
  }

  protected onUpdate(dt: number): void {
    const w = this.world;

    w.playerFlash = Math.max(0, w.playerFlash - dt * 3.2);
    w.aiFlash = Math.max(0, w.aiFlash - dt * 3.2);
    stepParticles(w.particles, dt);

    this.movePlayer(dt);
    this.moveAi(dt);

    if (w.serveIn > 0) {
      w.serveIn -= dt;
      // The ball rides the serving paddle until the countdown clears, so the
      // player can see where it is about to come from.
      w.ballX = COURT_W / 2;
      w.ballY = COURT_H / 2;
      w.trail.length = 0;
      if (w.serveIn <= 0) this.launch();
      return;
    }

    this.moveBall(dt);
  }

  /* -------------------------------------------------------------- rules */

  private launch(): void {
    const w = this.world;
    // Serve within 25 degrees of flat: enough variety to matter, never so
    // steep the first touch is a scramble.
    const angle = (Math.random() - 0.5) * 0.86;
    w.ballVX = Math.cos(angle) * BALL_SPEED_START * this.serveDirection;
    w.ballVY = Math.sin(angle) * BALL_SPEED_START;
  }

  private movePlayer(dt: number): void {
    const w = this.world;
    const half = PADDLE_H / 2;
    if (this.keyAxis !== 0) {
      w.playerY += this.keyAxis * PLAYER_SPEED * dt;
      // The keyboard wins while it is held; drop any stale pointer target so
      // the paddle does not snap back the moment the key is released.
      this.pointerTarget = null;
    } else if (this.pointerTarget !== null) {
      // Ease toward the pointer rather than teleporting: a jumped paddle reads
      // as a bug, and easing still arrives within a frame or two.
      const delta = this.pointerTarget - w.playerY;
      const step = Math.min(Math.abs(delta), PLAYER_SPEED * 1.6 * dt);
      w.playerY += Math.sign(delta) * step;
    }
    w.playerY = clamp(w.playerY, half, COURT_H - half);
  }

  private moveAi(dt: number): void {
    const w = this.world;
    const half = PADDLE_H / 2;

    this.aiThink -= dt;
    if (this.aiThink <= 0) {
      // Reaction delay: the AI only re-reads the court a few times a second.
      this.aiThink = 0.09 + Math.random() * 0.07;
      if (w.ballVX > 0 && w.serveIn <= 0) {
        const predicted = this.predictBallY();
        // Error grows with how far the ball still has to travel, so the AI
        // commits early and can be wrong-footed by a late angle.
        const distance = (COURT_W - INSET - PADDLE_W - w.ballX) / COURT_W;
        const error = (Math.random() - 0.5) * PADDLE_H * 1.15 * (0.35 + distance);
        this.aiTarget = predicted + error;
      } else {
        // Ball going away: drift back toward centre, slightly off so it does
        // not look like it snapped to a marker.
        this.aiTarget = COURT_H / 2 + (Math.random() - 0.5) * 60;
      }
    }

    const delta = this.aiTarget - w.aiY;
    // A deadzone stops the paddle vibrating around its target.
    if (Math.abs(delta) > 5) {
      w.aiY += Math.sign(delta) * Math.min(Math.abs(delta), AI_SPEED * dt);
    }
    w.aiY = clamp(w.aiY, half, COURT_H - half);
  }

  /** Where the ball will cross the AI's face, reflecting off the top and bottom. */
  private predictBallY(): number {
    const w = this.world;
    if (w.ballVX <= 0) return COURT_H / 2;
    const faceX = COURT_W - INSET - PADDLE_W - BALL_R;
    const time = (faceX - w.ballX) / w.ballVX;
    if (time <= 0) return w.ballY;

    // Unfold the bounces: reflect the free-flight position into the court.
    const span = COURT_H - BALL_R * 2;
    let y = w.ballY - BALL_R + w.ballVY * time;
    const period = span * 2;
    y = ((y % period) + period) % period;
    if (y > span) y = period - y;
    return y + BALL_R;
  }

  private moveBall(dt: number): void {
    const w = this.world;
    w.ballX += w.ballVX * dt;
    w.ballY += w.ballVY * dt;

    if (!this.reducedMotion) {
      w.trail.push({ x: w.ballX, y: w.ballY });
      if (w.trail.length > 16) w.trail.shift();
    } else {
      w.trail.length = 0;
    }

    // Walls.
    if (w.ballY < BALL_R) {
      w.ballY = BALL_R;
      w.ballVY = Math.abs(w.ballVY);
      this.spark(w.ballX, w.ballY, PALETTE.screen, 4);
    } else if (w.ballY > COURT_H - BALL_R) {
      w.ballY = COURT_H - BALL_R;
      w.ballVY = -Math.abs(w.ballVY);
      this.spark(w.ballX, w.ballY, PALETTE.screen, 4);
    }

    const playerFace = INSET + PADDLE_W;
    const aiFace = COURT_W - INSET - PADDLE_W;

    if (w.ballVX < 0 && w.ballX - BALL_R <= playerFace && w.ballX > INSET - BALL_R) {
      if (Math.abs(w.ballY - w.playerY) <= PADDLE_H / 2 + BALL_R) {
        this.bounce(playerFace + BALL_R, w.playerY, 1);
        w.playerFlash = 1;
        this.spark(playerFace, w.ballY, PALETTE.amber, 9);
      }
    } else if (w.ballVX > 0 && w.ballX + BALL_R >= aiFace && w.ballX < aiFace + PADDLE_W + BALL_R) {
      if (Math.abs(w.ballY - w.aiY) <= PADDLE_H / 2 + BALL_R) {
        this.bounce(aiFace - BALL_R, w.aiY, -1);
        w.aiFlash = 1;
        this.spark(aiFace, w.ballY, PALETTE.teal, 9);
      }
    }

    if (w.ballX < -BALL_R * 3) this.concede('ai');
    else if (w.ballX > COURT_W + BALL_R * 3) this.concede('player');
  }

  /** Reflects off a paddle, taking the angle from where on the paddle it hit. */
  private bounce(x: number, paddleY: number, direction: 1 | -1): void {
    const w = this.world;
    const offset = clamp((w.ballY - paddleY) / (PADDLE_H / 2), -1, 1);
    const speed = Math.min(
      Math.hypot(w.ballVX, w.ballVY) * BALL_SPEED_GAIN,
      BALL_SPEED_MAX,
    );
    const angle = offset * MAX_BOUNCE;
    w.ballX = x;
    w.ballVX = Math.cos(angle) * speed * direction;
    w.ballVY = Math.sin(angle) * speed;
  }

  private spark(x: number, y: number, colour: string, count: number): void {
    if (this.reducedMotion) return;
    spawnBurst(this.world.particles, x, y, count, colour, 150);
  }

  private concede(scorer: 'player' | 'ai'): void {
    const w = this.world;
    if (scorer === 'player') w.playerScore += 1;
    else w.aiScore += 1;

    w.ballVX = 0;
    w.ballVY = 0;
    w.trail.length = 0;
    // Serve toward whoever just conceded, so a run of points is not a rout.
    this.serveDirection = scorer === 'player' ? -1 : 1;
    w.serveIn = SERVE_DELAY;
    w.playerY = COURT_H / 2;
    w.aiY = COURT_H / 2;
    this.aiTarget = COURT_H / 2;

    if (w.playerScore >= TARGET_SCORE || w.aiScore >= TARGET_SCORE) {
      submitScore('pong', w.playerScore);
      this.finish(w.playerScore >= TARGET_SCORE ? 'won' : 'lost');
      return;
    }
    this.publish();
  }

  /* -------------------------------------------------------------- input */

  handleKey(event: KeyboardEvent, down: boolean): boolean {
    const { key } = event;
    if (isActionKey(key)) {
      if (!down) return true;
      if (this.status === 'ready') this.start();
      else if (this.status === 'paused') this.resume();
      else if (this.status === 'playing') this.pause();
      return true;
    }
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.keyUp = down;
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.keyDown = down;
    } else {
      return false;
    }
    // Holding both means stop, which is what the player asked for.
    this.keyAxis = (this.keyDown ? 1 : 0) - (this.keyUp ? 1 : 0);
    if (down && this.status === 'ready') this.start();
    return true;
  }

  handlePointer(event: PointerEvent): void {
    if (!this.surface) return;

    if (event.type === 'pointerdown') {
      this.pointerDragging = true;
      if (this.status === 'ready') this.start();
      else if (this.status === 'paused') this.resume();
    } else if (event.type === 'pointerup' || event.type === 'pointercancel') {
      this.pointerDragging = false;
      return;
    } else if (event.type === 'pointerleave') {
      this.pointerDragging = false;
      // Mouse left the stage: stop steering, but leave the paddle where it is.
      this.pointerTarget = null;
      return;
    }

    // A mouse steers on hover. A finger or pen only steers while it is down,
    // because there is no such thing as hovering with a finger.
    const steering = event.pointerType === 'mouse' || this.pointerDragging;
    if (!steering) return;

    const local = this.surface.toLocal(event);
    const box = letterbox(this.context(), COURT_W, COURT_H);
    if (box.scale <= 0) return;
    const courtY = (local.y - box.offsetY) / box.scale;
    this.pointerTarget = clamp(courtY, PADDLE_H / 2, COURT_H - PADDLE_H / 2);
    // The pointer takes over from a stuck key.
    this.keyAxis = 0;
    this.keyUp = false;
    this.keyDown = false;
  }

  /* ------------------------------------------------------ presentation */

  protected onRender(ctx: CanvasRenderingContext2D, view: GameContext): void {
    renderPong(ctx, view, this.world, this.status);
  }

  protected buildState(): GameState {
    const w = this.world;
    const state: GameState = {
      status: this.status,
      readouts: [
        { label: 'YOU', value: String(w.playerScore), tone: 'accent' },
        { label: 'CPU', value: String(w.aiScore), tone: 'live' },
        { label: 'TO WIN', value: String(TARGET_SCORE) },
      ],
    };

    if (this.status === 'won') {
      state.resultTitle = 'WIN';
      state.resultDetail = `${w.playerScore}–${w.aiScore}. The night shift holds.`;
      state.resultTone = 'win';
    } else if (this.status === 'lost') {
      // Losing 7–5 or better was a match, not a walkover. Say so.
      const close = w.playerScore >= TARGET_SCORE - 2;
      state.resultTitle = close ? 'CLOSE ONE' : 'TRY AGAIN';
      state.resultDetail = `${w.playerScore}–${w.aiScore}. ${
        close ? 'Two points in it.' : 'Watch the angle off the paddle.'
      }`;
      state.resultTone = close ? 'near' : 'loss';
    }
    return state;
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
