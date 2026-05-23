type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeWorkoutDraftChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyWorkoutDraftChanged(): void {
  listeners.forEach((fn) => fn());
}
