import AsyncStorage from "@react-native-async-storage/async-storage";
import { FEED_SCOPE_STORAGE_KEY, type FeedScope } from "../constants/feed";

export async function readStoredFeedScope(): Promise<FeedScope | null> {
  try {
    const raw = await AsyncStorage.getItem(FEED_SCOPE_STORAGE_KEY);
    if (raw === "following") return "following";
    if (raw === "all") return "all";
    if (raw === "saved") return "all";
    return null;
  } catch {
    return null;
  }
}

/** Primera visita: Seguidos por defecto. */
export async function resolveInitialFeedScope(followingCount: number): Promise<FeedScope> {
  const stored = await readStoredFeedScope();
  if (stored) return stored;
  return followingCount > 0 ? "following" : "following";
}

export async function writeStoredFeedScope(scope: FeedScope): Promise<void> {
  try {
    await AsyncStorage.setItem(FEED_SCOPE_STORAGE_KEY, scope);
  } catch {
    /* ignore */
  }
}
