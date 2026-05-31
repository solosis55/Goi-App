import { create } from "zustand";
import type { FeedScope } from "../constants/feed";
import { FEED_SUGGESTIONS_SNOOZE_DAYS } from "../constants/feedSuggestions";
import { loadFeedGoldBeamEnabled, saveFeedGoldBeamEnabled } from "../utils/feedGoldBeamPref";
import {
  loadMutedUserIds,
  loadSavedPostIds,
  loadSuggestionsDismiss,
  muteUser as persistMuteUser,
  saveSuggestionsDismiss,
  toggleSavedPost,
  type SuggestionsDismissState,
} from "../utils/feedLocalPrefs";
import { resolveInitialFeedScope, writeStoredFeedScope } from "../utils/feedScopeStorage";

type FeedPrefsState = {
  goldBeamEnabled: boolean;
  goldBeamHydrated: boolean;
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
  toggleSavedPostForUser: (userId: string, postId: string) => boolean;
  snoozeSuggestions: (userId: string) => Promise<void>;
  dismissSuggestionsPermanent: (userId: string) => Promise<void>;
  setSuggestionsDismissState: (userId: string, state: SuggestionsDismissState) => Promise<void>;
};

const defaultSuggestionsDismiss: SuggestionsDismissState = { mode: "none" };
const LOCAL_PREFS_STALE_MS = 60_000;

export const useFeedPrefsStore = create<FeedPrefsState>((set, get) => ({
  goldBeamEnabled: true,
  goldBeamHydrated: false,
  feedScope: "following",
  feedScopeReady: false,
  feedPrefsUserId: null,
  localPrefsHydratedAt: 0,
  mutedUserIds: [],
  savedPostIds: [],
  suggestionsDismiss: defaultSuggestionsDismiss,

  hydrateGoldBeam: async () => {
    const enabled = await loadFeedGoldBeamEnabled();
    set({ goldBeamEnabled: enabled, goldBeamHydrated: true });
  },

  setGoldBeamEnabled: async (value: boolean) => {
    set({ goldBeamEnabled: value, goldBeamHydrated: true });
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
    set({ mutedUserIds: [...prev, targetUserId], feedPrefsUserId: userId });
    try {
      await persistMuteUser(userId, targetUserId);
    } catch {
      set({ mutedUserIds: prev });
    }
  },

  toggleSavedPostForUser: (userId: string, postId: string) => {
    const prev = get().savedPostIds;
    const had = prev.includes(postId);
    const optimistic = had ? prev.filter((id) => id !== postId) : [postId, ...prev.filter((id) => id !== postId)];
    set({ savedPostIds: optimistic.slice(0, 500), feedPrefsUserId: userId });

    void (async () => {
      try {
        await toggleSavedPost(userId, postId);
        const ids = await loadSavedPostIds(userId);
        set({ savedPostIds: ids, feedPrefsUserId: userId });
      } catch {
        set({ savedPostIds: prev, feedPrefsUserId: userId });
      }
    })();

    return !had;
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
