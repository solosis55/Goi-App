import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PublicProfileOverview } from "../types/publicProfile";

const PREFIX = "goi:publicProfile:";
const TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  savedAt: number;
  data: PublicProfileOverview;
};

const memory = new Map<string, CacheEntry>();

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.savedAt <= TTL_MS;
}

/** Lectura instantánea (misma sesión / visita reciente). */
export function peekPublicProfileCache(userId: string): PublicProfileOverview | null {
  const entry = memory.get(userId);
  if (!entry || !isFresh(entry)) {
    if (entry) memory.delete(userId);
    return null;
  }
  return entry.data;
}

export async function readPublicProfileCache(userId: string): Promise<PublicProfileOverview | null> {
  const mem = peekPublicProfileCache(userId);
  if (mem) return mem;

  try {
    const raw = await AsyncStorage.getItem(`${PREFIX}${userId}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (!isFresh(entry)) {
      await AsyncStorage.removeItem(`${PREFIX}${userId}`);
      memory.delete(userId);
      return null;
    }
    memory.set(userId, entry);
    return entry.data;
  } catch {
    return null;
  }
}

export async function writePublicProfileCache(
  userId: string,
  data: PublicProfileOverview
): Promise<void> {
  const entry: CacheEntry = { savedAt: Date.now(), data };
  memory.set(userId, entry);
  try {
    await AsyncStorage.setItem(`${PREFIX}${userId}`, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}
