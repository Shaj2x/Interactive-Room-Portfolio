/**
 * Best scores for the current visit.
 *
 * Session-scoped on purpose: the handoff asks for a session best, and a score
 * that survives in localStorage invites the question of whose score it is on a
 * shared machine. It lives in memory, module-scoped, so it survives switching
 * between games and closing the Play section but not a reload.
 */

export type ArcadeId = 'pong' | 'snake' | 'time-it' | 'updraft';

type Bests = Partial<Record<ArcadeId, number>>;

const bests: Bests = {};
const listeners = new Set<(bests: Bests) => void>();

/** How to compare two scores for a game: higher is better, except a time delta. */
const LOWER_IS_BETTER: Record<ArcadeId, boolean> = {
  pong: false,
  snake: false,
  'time-it': true,
  updraft: false,
};

/** Records a score if it beats the stored one. Returns true when it did. */
export function submitScore(id: ArcadeId, score: number): boolean {
  const current = bests[id];
  const better =
    current === undefined || (LOWER_IS_BETTER[id] ? score < current : score > current);
  if (!better) return false;
  bests[id] = score;
  for (const listener of listeners) listener({ ...bests });
  return true;
}

export function getBest(id: ArcadeId): number | undefined {
  return bests[id];
}

export function clearBest(id: ArcadeId): void {
  delete bests[id];
  for (const listener of listeners) listener({ ...bests });
}

export function subscribeBests(listener: (bests: Bests) => void): () => void {
  listeners.add(listener);
  listener({ ...bests });
  return () => listeners.delete(listener);
}
