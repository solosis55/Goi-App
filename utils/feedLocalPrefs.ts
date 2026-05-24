import AsyncStorage from "@react-native-async-storage/async-storage";

/** Preferencias locales del feed (guardados, silenciados) — mismas claves que Goi Web. */

const savedKey = (userId: string) => `goi:feedSaved:${userId}`;
const mutedKey = (userId: string) => `goi:feedMuted:${userId}`;
const reportsKey = (userId: string) => `goi:feedReports:${userId}`;
const suggestionsDismissedKey = (userId: string) => `goi:feedSuggestionsDismissed:${userId}`;
const suggestionsDismissV2Key = (userId: string) => `goi:feedSuggestionsDismiss:v2:${userId}`;

export type SuggestionsDismissState =
  | { mode: "none" }
  | { mode: "snooze"; until: string }
  | { mode: "permanent" };

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

export function isSuggestionsDismissed(state: SuggestionsDismissState): boolean {
  if (state.mode === "none") return false;
  if (state.mode === "permanent") return true;
  return new Date(state.until).getTime() > Date.now();
}

export async function loadSuggestionsDismiss(userId: string): Promise<SuggestionsDismissState> {
  const v2 = await readJson<SuggestionsDismissState | null>(suggestionsDismissV2Key(userId), null);
  if (v2 && v2.mode !== "none") {
    if (v2.mode === "snooze" && new Date(v2.until).getTime() <= Date.now()) {
      return { mode: "none" };
    }
    return v2;
  }

  const legacy = await readJson<boolean>(suggestionsDismissedKey(userId), false);
  if (legacy) return { mode: "permanent" };
  return { mode: "none" };
}

/** @deprecated Usar loadSuggestionsDismiss */
export async function loadSuggestionsDismissed(userId: string): Promise<boolean> {
  const state = await loadSuggestionsDismiss(userId);
  return isSuggestionsDismissed(state);
}

export async function saveSuggestionsDismiss(
  userId: string,
  state: SuggestionsDismissState
): Promise<void> {
  await writeJson(suggestionsDismissV2Key(userId), state);
  if (state.mode === "permanent") {
    await writeJson(suggestionsDismissedKey(userId), true);
  } else if (state.mode === "none") {
    await writeJson(suggestionsDismissedKey(userId), false);
  }
}

/** @deprecated Usar saveSuggestionsDismiss */
export async function setSuggestionsDismissed(userId: string, dismissed: boolean): Promise<void> {
  await saveSuggestionsDismiss(userId, dismissed ? { mode: "permanent" } : { mode: "none" });
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
