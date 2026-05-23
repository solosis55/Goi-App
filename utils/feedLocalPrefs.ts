import AsyncStorage from "@react-native-async-storage/async-storage";

/** Preferencias locales del feed (guardados, silenciados) — mismas claves que Goi Web. */

const savedKey = (userId: string) => `goi:feedSaved:${userId}`;
const mutedKey = (userId: string) => `goi:feedMuted:${userId}`;
const reportsKey = (userId: string) => `goi:feedReports:${userId}`;
const suggestionsDismissedKey = (userId: string) => `goi:feedSuggestionsDismissed:${userId}`;

export type LocalFeedReport = {
  postId: string;
  authorId: string;
  reason: string;
  createdAt: string;
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export async function loadSavedPostIds(userId: string): Promise<string[]> {
  const raw = await readJson<string[]>(savedKey(userId), []);
  return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
}

export async function saveSavedPostIds(userId: string, ids: string[]): Promise<void> {
  await writeJson(savedKey(userId), ids);
}

export async function toggleSavedPost(userId: string, postId: string): Promise<boolean> {
  const ids = await loadSavedPostIds(userId);
  const i = ids.indexOf(postId);
  if (i >= 0) {
    ids.splice(i, 1);
    await saveSavedPostIds(userId, ids);
    return false;
  }
  ids.unshift(postId);
  await saveSavedPostIds(userId, ids.slice(0, 500));
  return true;
}

export async function pruneSavedPostIdsToExisting(
  userId: string,
  existingPostIds: Set<string>
): Promise<number> {
  const ids = await loadSavedPostIds(userId);
  const next = ids.filter((id) => existingPostIds.has(id));
  const removed = ids.length - next.length;
  if (removed > 0) await saveSavedPostIds(userId, next);
  return removed;
}

export async function loadMutedUserIds(userId: string): Promise<string[]> {
  const raw = await readJson<string[]>(mutedKey(userId), []);
  return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
}

export async function saveMutedUserIds(userId: string, ids: string[]): Promise<void> {
  await writeJson(mutedKey(userId), ids);
}

export async function muteUser(userId: string, targetUserId: string): Promise<void> {
  if (targetUserId === userId) return;
  const ids = new Set(await loadMutedUserIds(userId));
  ids.add(targetUserId);
  await saveMutedUserIds(userId, [...ids]);
}

export async function unmuteUser(userId: string, targetUserId: string): Promise<void> {
  const ids = (await loadMutedUserIds(userId)).filter((id) => id !== targetUserId);
  await saveMutedUserIds(userId, ids);
}

export async function loadSuggestionsDismissed(userId: string): Promise<boolean> {
  return readJson<boolean>(suggestionsDismissedKey(userId), false);
}

export async function setSuggestionsDismissed(userId: string, dismissed: boolean): Promise<void> {
  await writeJson(suggestionsDismissedKey(userId), dismissed);
}

export async function appendLocalReport(
  viewerId: string,
  entry: Omit<LocalFeedReport, "createdAt"> & { createdAt?: string }
): Promise<void> {
  const list = await readJson<LocalFeedReport[]>(reportsKey(viewerId), []);
  const row: LocalFeedReport = {
    ...entry,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
  list.unshift(row);
  await writeJson(reportsKey(viewerId), list.slice(0, 200));
}
