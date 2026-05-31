import AsyncStorage from "@react-native-async-storage/async-storage";
import { MENTION_RECENTS_KEY_PREFIX } from "../constants/storageKeys";
import type { MentionPickUser } from "./mentionAutocomplete";

export const MENTION_RECENTS_LIMIT = 12;

export function mentionRecentsStorageKey(userId: string) {
  return `${MENTION_RECENTS_KEY_PREFIX}:${userId}`;
}

export async function loadMentionRecents(userId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(mentionRecentsStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, MENTION_RECENTS_LIMIT);
  } catch {
    return [];
  }
}

export async function saveMentionRecents(userId: string, ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      mentionRecentsStorageKey(userId),
      JSON.stringify(ids.slice(0, MENTION_RECENTS_LIMIT))
    );
  } catch {
    /* ignore */
  }
}

export function nextMentionRecents(current: string[], picked: MentionPickUser, userId?: string): string[] {
  if (!userId || picked.id === userId) return current;
  return [picked.id, ...current.filter((id) => id !== picked.id)].slice(0, MENTION_RECENTS_LIMIT);
}
