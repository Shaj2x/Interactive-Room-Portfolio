import { useCallback, useEffect, useRef, useState } from 'react';
import type { EmbeddedGame, GameState } from '../game/arcadeTypes';
import { isOver } from '../game/arcadeTypes';
import { attachInput } from '../game/input';
import { clearBest } from '../game/scoreStore';
import type { Cabinet } from './registry';

const EMPTY: GameState = { status: 'ready', readouts: [] };

interface Props {
  cabinet: Cabinet;
  reducedMotion: boolean;
  /** Returns focus to the cabinet list. */
  onExit: () => void;
}

/**
 * Hosts one game: owns the canvas element, the instance's lifetime, and the
 * chrome around it. Everything that happens *inside* the canvas belongs to the
 * game object; everything outside it belongs to React.
 */
export function ArcadeStage({ cabinet, reducedMotion, onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<EmbeddedGame | null>(null);
  const [state, setState] = useState<GameState>(EMPTY);
  // Rendered from the instance rather than the registry, so the strings the
  // game reports and the strings on screen can never drift apart.
  const [meta, setMeta] = useState({ objective: cabinet.tagline, controls: '', pausable: true });

  // Read inside the mount effect without making it a dependency: a change of
  // motion preference must not tear down a running game.
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // The instance is created *inside* the effect. Under StrictMode this
    // effect runs twice, and building the game here means the discarded first
    // run destroys its own instance rather than the one left on screen.
    const game = cabinet.create();
    gameRef.current = game;
    game.setReducedMotion(reducedRef.current);
    game.mount(canvas);
    setMeta({ objective: game.objective, controls: game.controls, pausable: game.pausable });

    const unsubscribe = game.subscribe(setState);
    const detachInput = attachInput(canvas, { getGame: () => gameRef.current });

    return () => {
      detachInput();
      unsubscribe();
      game.destroy();
      if (gameRef.current === game) gameRef.current = null;
    };
  }, [cabinet]);

  useEffect(() => {
    gameRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  // A game left running behind a hidden tab is a game you come back to having
  // lost. Pause it instead.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) gameRef.current?.pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const start = useCallback(() => gameRef.current?.start(), []);
  const restart = useCallback(() => gameRef.current?.start(), []);
  const togglePause = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    if (game.getState().status === 'paused') game.resume();
    else game.pause();
  }, []);
  const resetBest = useCallback(() => {
    clearBest(cabinet.id);
    gameRef.current?.resetBest?.();
  }, [cabinet.id]);

  const { status } = state;
  const over = isOver(status);

  return (
    <div className="arc-stage" key={cabinet.id}>
      <header className="arc-stage-head">
        <div>
          <p className="arc-kind">{cabinet.kind}</p>
          <h3 className="arc-name">{cabinet.name}</h3>
        </div>
        <dl className="arc-hud">
          {state.readouts.map((r) => (
            <div key={r.label} className={`arc-hud-cell tone-${r.tone ?? 'default'}`}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="arc-canvas-wrap" style={{ aspectRatio: String(cabinet.aspect) }}>
        <canvas
          ref={canvasRef}
          className="arc-canvas"
          tabIndex={0}
          role="application"
          aria-label={`${cabinet.name}. ${meta.objective} Controls: ${meta.controls}`}
        />

        {status === 'ready' && (
          <div className="arc-overlay arc-overlay-ready">
            <p className="arc-overlay-kicker">Ready</p>
            <p className="arc-overlay-line">{meta.objective}</p>
            <button type="button" className="arc-btn primary" onClick={start}>
              Start
            </button>
          </div>
        )}

        {status === 'paused' && (
          <div className="arc-overlay arc-overlay-paused">
            <p className="arc-overlay-kicker">Paused</p>
            <button type="button" className="arc-btn primary" onClick={togglePause}>
              Resume
            </button>
          </div>
        )}

        {over && (
          <div className={`arc-overlay arc-overlay-result tone-${state.resultTone ?? 'loss'}`}>
            <p className="arc-overlay-title">{state.resultTitle ?? 'Run over'}</p>
            {state.resultDetail && <p className="arc-overlay-line">{state.resultDetail}</p>}
            <div className="arc-overlay-actions">
              <button type="button" className="arc-btn primary" onClick={restart}>
                Play again
              </button>
              <button type="button" className="arc-btn" onClick={onExit}>
                Back to games
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="arc-controls">
        <div className="arc-buttons">
          {status === 'ready' ? (
            <button type="button" className="arc-btn primary" onClick={start}>
              Start
            </button>
          ) : (
            <button type="button" className="arc-btn" onClick={restart}>
              Restart
            </button>
          )}
          {meta.pausable && (
            <button
              type="button"
              className="arc-btn"
              onClick={togglePause}
              disabled={status !== 'playing' && status !== 'paused'}
            >
              {status === 'paused' ? 'Resume' : 'Pause'}
            </button>
          )}
          <button type="button" className="arc-btn" onClick={resetBest}>
            Reset best
          </button>
          <button type="button" className="arc-btn quiet" onClick={onExit}>
            Back to games
          </button>
        </div>
        <p className="arc-hint">{meta.controls}</p>
      </div>

      {/* Anything the canvas says visually, said once for a screen reader. */}
      <p className="sr-only" role="status" aria-live="polite">
        {over
          ? `${state.resultTitle ?? 'Run over'}. ${state.resultDetail ?? ''}`
          : status === 'playing'
            ? `${cabinet.name} in play.`
            : status === 'paused'
              ? 'Paused.'
              : `${cabinet.name} ready. ${meta.objective}`}
      </p>
    </div>
  );
}
