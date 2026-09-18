import { play } from '../content/profile';
import type { EmbeddedGame } from '../game/arcadeTypes';
import type { ArcadeId } from '../game/scoreStore';
import { PongGame } from '../game/pong/PongGame';
import { SnakeGame } from '../game/snake/SnakeGame';
import { TimeItGame, ASPECT as TIME_IT_ASPECT } from '../game/time-it/TimeItGame';
import { UpdraftGame } from '../game/updraft/UpdraftGame';
import { ASPECT as PONG_ASPECT } from '../game/pong/constants';
import { ASPECT as SNAKE_ASPECT } from '../game/snake/constants';
import { ASPECT as UPDRAFT_ASPECT } from '../game/updraft/constants';

/**
 * Factories rather than instances: switching away from a cabinet and back must
 * give a genuinely new game, with nothing carried over from the last run and
 * nothing still subscribed to the old one.
 */
const FACTORIES: Record<ArcadeId, () => EmbeddedGame> = {
  pong: () => new PongGame(),
  snake: () => new SnakeGame(),
  'time-it': () => new TimeItGame(),
  updraft: () => new UpdraftGame(),
};

/**
 * Each game's logical aspect. The stage takes this shape, so a game fills it
 * edge to edge instead of sitting inside letterbox bands — which mattered most
 * on a phone, where a wide court inside a square stage wasted half the screen.
 */
const ASPECTS: Record<ArcadeId, number> = {
  pong: PONG_ASPECT,
  snake: SNAKE_ASPECT,
  'time-it': TIME_IT_ASPECT,
  updraft: UPDRAFT_ASPECT,
};

export interface Cabinet {
  id: ArcadeId;
  name: string;
  /** Two words on the selector: what kind of game this is. */
  kind: string;
  /** The one-line objective, readable before anything is clicked. */
  tagline: string;
  /** Width divided by height of the game's logical playfield. */
  aspect: number;
  create: () => EmbeddedGame;
}

/**
 * The four cabinets. Copy comes from `profile.ts` — the site's single source of
 * truth for words — and only the implementation is wired up here.
 */
export const CABINETS: Cabinet[] = play.games.map((game) => ({
  id: game.id,
  name: game.name,
  kind: game.kind,
  tagline: game.how,
  aspect: ASPECTS[game.id],
  create: FACTORIES[game.id],
}));

export const CABINET_BY_ID = Object.fromEntries(CABINETS.map((c) => [c.id, c])) as Record<
  ArcadeId,
  Cabinet
>;
