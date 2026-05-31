import type { SocialHubResponse } from "../types/socialHub";

const TTL_MS = 45_000;
const store = new Map<string, { at: number; data: SocialHubResponse }>();

export function readSocialHubCache(userId: string): SocialHubResponse | null {
  const entry = store.get(userId);
  if (!entry || Date.now() - entry.at > TTL_MS) return null;
  return entry.data;
}

export function writeSocialHubCache(userId: string, data: SocialHubResponse): void {
  store.set(userId, { at: Date.now(), data });
}

export function invalidateSocialHubCache(userId?: string): void {
  if (userId) store.delete(userId);
  else store.clear();
}
