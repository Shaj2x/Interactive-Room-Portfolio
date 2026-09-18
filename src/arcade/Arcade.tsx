import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { subscribeBests, type ArcadeId } from '../game/scoreStore';
import { ArcadeStage } from './ArcadeStage';
import { CABINETS, CABINET_BY_ID } from './registry';
import './arcade.css';

/**
 * The Play section's arcade: four cabinets down the left, the live game on the
 * right. Selecting a cabinet swaps the game in place — nothing navigates, and
 * nothing leaves the site.
 */
export function Arcade() {
  const [selected, setSelected] = useState<ArcadeId>('pong');
  const [bests, setBests] = useState<Partial<Record<ArcadeId, number>>>({});
  const reducedMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeBests(setBests), []);

  /** Sends focus back to the selected cabinet, for "Back to games". */
  const focusList = () => {
    listRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
  };

  return (
    <div className="arcade">
      <div className="arc-cabinets" ref={listRef} role="tablist" aria-label="Choose a game">
        {CABINETS.map((cabinet) => {
          const active = cabinet.id === selected;
          const best = bests[cabinet.id];
          return (
            <button
              key={cabinet.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-current={active}
              className={`arc-cabinet${active ? ' is-active' : ''}`}
              onClick={() => setSelected(cabinet.id)}
            >
              <span className="arc-cabinet-kind">{cabinet.kind}</span>
              <span className="arc-cabinet-name">{cabinet.name}</span>
              <span className="arc-cabinet-tag">{cabinet.tagline}</span>
              {best !== undefined && (
                <span className="arc-cabinet-best">
                  Best {cabinet.id === 'time-it' ? `±${best.toFixed(2)}s` : best}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <ArcadeStage
        cabinet={CABINET_BY_ID[selected]}
        reducedMotion={reducedMotion}
        onExit={focusList}
      />
    </div>
  );
}
