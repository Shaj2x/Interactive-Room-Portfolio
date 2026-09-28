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
 * Whether the current section's history entry was pushed by this page. If it
 * was, closing the section can safely go back one entry. If the visitor
 * arrived on a shared link (#projects), going back would leave the site, so
 * closing clears the hash in place instead.
 */
let pushedSection = false;

/**
 * Hash routing in ~40 lines instead of a router dependency. Sections are real
 * history entries, so the browser back button pulls the camera back out to the
 * room — the brief's "never trap the user in a section".
 */
export function useHashRoute(): [SectionId | null, (id: SectionId | null) => void] {
  const [route, setRoute] = useState<SectionId | null>(() =>
    typeof window === 'undefined' ? null : read(),
  );

  useEffect(() => {
    const onHash = () => {
      const next = read();
      if (next === null) pushedSection = false;
      setRoute(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((id: SectionId | null) => {
    if (id === null) {
      if (pushedSection) {
        // Prefer real back so we don't pile up history entries.
        pushedSection = false;
        window.history.back();
      } else {
        // Arrived on a deep link: stay on the site and return to the room.
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        setRoute(null);
      }
    } else if (read() !== null) {
      // Section to section replaces the entry, so one Back always reaches the room.
      window.location.replace(`#${id}`);
    } else {
      pushedSection = true;
      window.location.hash = id;
    }
  }, []);

  return [route, navigate];
}
