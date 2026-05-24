import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PublicProfileOverview } from "../types/publicProfile";

const PREFIX = "goi:publicProfile:";
const TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  savedAt: number;
  data: PublicProfileOverview;
};

export async function readPublicProfileCache(userId: string): Promise<PublicProfileOverview | null> {
  try {
    const raw = await AsyncStorage.getItem(`${PREFIX}${userId}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.savedAt > TTL_MS) {
      await AsyncStorage.removeItem(`${PREFIX}${userId}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function writePublicProfileCache(userId: string, data: PublicProfileOverview): Promise<void> {
  try {
    const entry: CacheEntry = { savedAt: Date.now(), data };
    await AsyncStorage.setItem(`${PREFIX}${userId}`, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}
