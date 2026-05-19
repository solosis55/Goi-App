/** Sustituto móvil de `window.dispatchEvent(AUTH_EXPIRED_EVENT)` en Goi Web. */

type Listener = () => void;

const listeners = new Set<Listener>();

export function onAuthExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitAuthExpired() {
  for (const listener of listeners) listener();
}
