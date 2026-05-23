import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORY_SEEN_STORAGE_KEY } from "../constants/storageKeys";
import type { FeedStorySlide } from "../types/story";

export function signatureForSlides(slides: FeedStorySlide[]) {
  return slides
    .map((s) => s.id)
    .sort()
    .join("|");
}

async function readSeen(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(STORY_SEEN_STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    return p && typeof p === "object" && !Array.isArray(p) ? (p as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function loadStorySeenMap(): Promise<Record<string, string>> {
  return readSeen();
}

export async function markStoryAuthorSeen(userId: string, slides: FeedStorySlide[]) {
  if (!slides.length) return;
  const sig = signatureForSlides(slides);
  const next = await readSeen();
  next[userId] = sig;
  try {
    await AsyncStorage.setItem(STORY_SEEN_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function hasUnseenStories(_userId: string, slides: FeedStorySlide[], seenSig: string | undefined) {
  if (!slides.length) return false;
  return signatureForSlides(slides) !== (seenSig ?? "");
}
