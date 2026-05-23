import AsyncStorage from "@react-native-async-storage/async-storage";
import { FEED_SCOPE_STORAGE_KEY, type FeedScope } from "../constants/feed";

export async function readStoredFeedScope(): Promise<FeedScope> {
  try {
    const raw = await AsyncStorage.getItem(FEED_SCOPE_STORAGE_KEY);
    if (raw === "following") return "following";
    if (raw === "all") return "all";
    if (raw === "saved") return "all";
    return "all";
  } catch {
    return "all";
  }
}

export async function writeStoredFeedScope(scope: FeedScope): Promise<void> {
  try {
    await AsyncStorage.setItem(FEED_SCOPE_STORAGE_KEY, scope);
  } catch {
    /* ignore */
  }
}
