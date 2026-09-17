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
 * Hash routing in ~30 lines instead of a router dependency. Sections are real
 * history entries, so the browser back button pulls the camera back out to the
 * room — the brief's "never trap the user in a section".
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
    if (id === null) {
      // Prefer real back so we don't pile up history entries.
      if (window.history.length > 1 && read() !== null) window.history.back();
      else window.location.hash = '';
    } else {
      window.location.hash = id;
    }
  }, []);

  return [route, navigate];
}
