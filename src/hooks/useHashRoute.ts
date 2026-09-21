import { useCallback, useEffect, useState } from 'react';
import type { SectionId } from '../content/profile';

const VALID: SectionId[] = [
  'build',
  'record',
  'about',
  'leadership',
  'projects',
  'play',
  'contact',
  'resume',
];

function read(): SectionId | null {
  const raw = window.location.hash.replace(/^#\/?/, '');
  return (VALID as string[]).includes(raw) ? (raw as SectionId) : null;
}

/**
 * Hash routing in a few dozen lines instead of a router dependency. Sections
 * are real history entries, so the browser back button pulls the camera back
 * out to the room — the brief's "never trap the user in a section".
 *
 * Entries this app pushes are marked in `history.state`. Closing a section
 * steps back only when the current entry carries that mark; arriving straight
 * at `#play` from a link and pressing Escape would otherwise step back to
 * whatever the visitor was looking at before, which is off the site entirely.
 */
export function useHashRoute(): [SectionId | null, (id: SectionId | null) => void] {
  const [route, setRoute] = useState<SectionId | null>(() =>
    typeof window === 'undefined' ? null : read(),
  );

  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((id: SectionId | null) => {
    if (id !== null) {
      // Marked, so closing later can tell our own entry from someone else's.
      window.history.pushState({ roomSection: true }, '', `#${id}`);
      setRoute(id);
      return;
    }

    // Closing. Stepping back is right only when the entry being left is one we
    // pushed; otherwise the previous entry belongs to wherever the visitor came
    // from, and `history.back()` takes them off the site instead of back to the
    // room. That is the common case for a shared link or a search result, where
    // `history.length` is greater than one but none of it is ours.
    if ((window.history.state as { roomSection?: boolean } | null)?.roomSection) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    // replaceState fires no hashchange, so the listener below will not see this.
    setRoute(null);
  }, []);

  return [route, navigate];
}
