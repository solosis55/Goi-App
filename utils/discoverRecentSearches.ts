import AsyncStorage from "@react-native-async-storage/async-storage";

const key = (userId: string) => `goi:discoverRecentSearches:${userId}`;
const MAX = 8;

export async function loadDiscoverRecentSearches(userId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, MAX);
  } catch {
    return [];
  }
}

export async function pushDiscoverRecentSearch(userId: string, term: string): Promise<string[]> {
  const q = term.trim();
  if (!q) return loadDiscoverRecentSearches(userId);
  const prev = await loadDiscoverRecentSearches(userId);
  const next = [q, ...prev.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
  await AsyncStorage.setItem(key(userId), JSON.stringify(next));
  return next;
}

export async function clearDiscoverRecentSearches(userId: string): Promise<void> {
  await AsyncStorage.removeItem(key(userId));
}
