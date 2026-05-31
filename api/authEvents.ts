/** Sustituto móvil de `window.dispatchEvent(AUTH_EXPIRED_EVENT)` en Goi Web. */

export type AuthExpiredDetail = {
  code?: string;
};

type Listener = (detail?: AuthExpiredDetail) => void;

const listeners = new Set<Listener>();

export function onAuthExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitAuthExpired(detail?: AuthExpiredDetail) {
  for (const listener of listeners) listener(detail);
}
