import { useSyncExternalStore } from "react";

// Small localStorage-backed numbers (resume positions, speed, volume). Read through
// useSyncExternalStore so the server render and hydration see `null` and the stored value arrives
// right after, without a hydration mismatch. Every access is wrapped: storage can be missing,
// full or blocked (private mode, disabled cookies).

const PREFIX = "wta-audio:";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(PREFIX)) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function readNumber(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeNumber(key: string, value: number | null) {
  try {
    if (value === null) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, String(value));
  } catch {
    // Storage unavailable: the feature degrades to "no memory", nothing else breaks.
  }
  for (const listener of listeners) listener();
}

export function useStoredNumber(key: string): number | null {
  return useSyncExternalStore(
    subscribe,
    () => readNumber(key),
    () => null,
  );
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. */
export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
