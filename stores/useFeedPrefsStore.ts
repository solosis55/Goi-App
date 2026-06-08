import { create } from "zustand";
import type { FeedScope } from "../constants/feed";
import { FEED_SUGGESTIONS_SNOOZE_DAYS } from "../constants/feedSuggestions";
import { loadFeedGoldBeamEnabled, saveFeedGoldBeamEnabled } from "../utils/feedGoldBeamPref";
import {
  loadMutedUserIds,
  loadSavedPostIds,
  loadSuggestionsDismiss,
  saveMutedUserIds,
  saveSavedPostIds,
  saveSuggestionsDismiss,
  type SuggestionsDismissState,
} from "../utils/feedLocalPrefs";
import { resolveInitialFeedScope, writeStoredFeedScope } from "../utils/feedScopeStorage";

type FeedPrefsState = {
  goldBeamEnabled: boolean;
  feedScope: FeedScope;
  feedScopeReady: boolean;
  feedPrefsUserId: string | null;
  localPrefsHydratedAt: number;
  mutedUserIds: string[];
  savedPostIds: string[];
  suggestionsDismiss: SuggestionsDismissState;

  hydrateGoldBeam: () => Promise<void>;
  setGoldBeamEnabled: (value: boolean) => Promise<void>;

  resetFeedLocalPrefs: () => void;
  hydrateFeedLocalPrefs: (userId: string | undefined, opts?: { force?: boolean }) => Promise<void>;
  initFeedScope: (followingCount: number) => Promise<FeedScope>;
  setFeedScope: (scope: FeedScope) => Promise<void>;
  muteAuthor: (userId: string, targetUserId: string) => Promise<void>;
  unmuteAuthor: (userId: string, targetUserId: string) => Promise<void>;
  toggleSavedPostForUser: (userId: string, postId: string) => boolean;
  pruneSavedPostsToExisting: (userId: string, existingPostIds: Set<string>) => Promise<number>;
  snoozeSuggestions: (userId: string) => Promise<void>;
  dismissSuggestionsPermanent: (userId: string) => Promise<void>;
  setSuggestionsDismissState: (userId: string, state: SuggestionsDismissState) => Promise<void>;
};

const defaultSuggestionsDismiss: SuggestionsDismissState = { mode: "none" };
const LOCAL_PREFS_STALE_MS = 60_000;

export const useFeedPrefsStore = create<FeedPrefsState>((set, get) => ({
  goldBeamEnabled: true,
  feedScope: "following",
  feedScopeReady: false,
  feedPrefsUserId: null,
  localPrefsHydratedAt: 0,
  mutedUserIds: [],
  savedPostIds: [],
  suggestionsDismiss: defaultSuggestionsDismiss,

  hydrateGoldBeam: async () => {
    const enabled = await loadFeedGoldBeamEnabled();
    set({ goldBeamEnabled: enabled });
  },

  setGoldBeamEnabled: async (value: boolean) => {
    set({ goldBeamEnabled: value });
    await saveFeedGoldBeamEnabled(value);
  },

  resetFeedLocalPrefs: () => {
    set({
      feedScope: "following",
      feedScopeReady: false,
      feedPrefsUserId: null,
      localPrefsHydratedAt: 0,
      mutedUserIds: [],
      savedPostIds: [],
      suggestionsDismiss: defaultSuggestionsDismiss,
    });
  },

  hydrateFeedLocalPrefs: async (userId: string | undefined, opts?: { force?: boolean }) => {
    if (!userId) {
      get().resetFeedLocalPrefs();
      return;
    }
    const state = get();
    if (
      !opts?.force &&
      state.feedPrefsUserId === userId &&
      state.localPrefsHydratedAt > 0 &&
      Date.now() - state.localPrefsHydratedAt < LOCAL_PREFS_STALE_MS
    ) {
      return;
    }
    const [muted, saved, suggestions] = await Promise.all([
      loadMutedUserIds(userId),
      loadSavedPostIds(userId),
      loadSuggestionsDismiss(userId),
    ]);
    set({
      feedPrefsUserId: userId,
      localPrefsHydratedAt: Date.now(),
      mutedUserIds: muted,
      savedPostIds: saved,
      suggestionsDismiss: suggestions,
    });
  },

  initFeedScope: async (followingCount: number) => {
    const scope = await resolveInitialFeedScope(followingCount);
    set({ feedScope: scope, feedScopeReady: true });
    return scope;
  },

  setFeedScope: async (scope: FeedScope) => {
    set({ feedScope: scope, feedScopeReady: true });
    await writeStoredFeedScope(scope);
  },

  muteAuthor: async (userId: string, targetUserId: string) => {
    const prev = get().mutedUserIds;
    if (targetUserId === userId || prev.includes(targetUserId)) return;
    const next = [...prev, targetUserId];
    set({ mutedUserIds: next, feedPrefsUserId: userId });
    try {
      await saveMutedUserIds(userId, next);
    } catch {
      set({ mutedUserIds: prev });
    }
  },

  unmuteAuthor: async (userId: string, targetUserId: string) => {
    const prev = get().mutedUserIds;
    if (!prev.includes(targetUserId)) return;
    const next = prev.filter((id) => id !== targetUserId);
    set({ mutedUserIds: next, feedPrefsUserId: userId });
    try {
      await saveMutedUserIds(userId, next);
    } catch {
      set({ mutedUserIds: prev });
    }
  },

  toggleSavedPostForUser: (userId: string, postId: string) => {
    const prev = get().savedPostIds;
    const had = prev.includes(postId);
    const next = had
      ? prev.filter((id) => id !== postId)
      : [postId, ...prev.filter((id) => id !== postId)];
    const optimistic = next.slice(0, 500);
    set({ savedPostIds: optimistic, feedPrefsUserId: userId });

    void (async () => {
      try {
        await saveSavedPostIds(userId, optimistic);
      } catch {
        set({ savedPostIds: prev, feedPrefsUserId: userId });
      }
    })();

    return !had;
  },

  pruneSavedPostsToExisting: async (userId: string, existingPostIds: Set<string>) => {
    const prev = get().savedPostIds;
    const next = prev.filter((id) => existingPostIds.has(id));
    const removed = prev.length - next.length;
    if (removed === 0) return 0;
    set({ savedPostIds: next, feedPrefsUserId: userId });
    try {
      await saveSavedPostIds(userId, next);
    } catch {
      set({ savedPostIds: prev, feedPrefsUserId: userId });
      return 0;
    }
    return removed;
  },

  snoozeSuggestions: async (userId: string) => {
    const until = new Date();
    until.setDate(until.getDate() + FEED_SUGGESTIONS_SNOOZE_DAYS);
    const state: SuggestionsDismissState = { mode: "snooze", until: until.toISOString() };
    set({ suggestionsDismiss: state, feedPrefsUserId: userId });
    await saveSuggestionsDismiss(userId, state);
  },

  dismissSuggestionsPermanent: async (userId: string) => {
    const state: SuggestionsDismissState = { mode: "permanent" };
    set({ suggestionsDismiss: state, feedPrefsUserId: userId });
    await saveSuggestionsDismiss(userId, state);
  },

  setSuggestionsDismissState: async (userId: string, state: SuggestionsDismissState) => {
    set({ suggestionsDismiss: state, feedPrefsUserId: userId });
    await saveSuggestionsDismiss(userId, state);
  },
}));

export type { SuggestionsDismissState };
