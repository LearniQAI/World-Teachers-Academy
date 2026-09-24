// Site-wide coordination between AudioPlayer instances: only one plays at a time, and only the
// player that last started owns the Media Session (lock-screen controls). A module singleton rather
// than a React context, so players in separate client islands still see each other.

type Listener = (ownerId: string) => void;

const listeners = new Set<Listener>();
let sessionOwner: string | null = null;

/** Announce that `id` started playing; every other player pauses itself. */
export function claimPlayback(id: string) {
  sessionOwner = id;
  for (const listener of listeners) listener(id);
}

export function onPlaybackClaimed(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function ownsMediaSession(id: string) {
  return sessionOwner === id;
}

export function releaseMediaSession(id: string) {
  if (sessionOwner === id) sessionOwner = null;
}
