import { create } from "zustand";
import {
  getPendingFollowRequests,
  getSocialHub,
  toggleFollow as toggleFollowApi,
  type ToggleFollowResponse,
} from "../api/auth";
import { getNotifications } from "../api/posts";
import { ApiError } from "../api/client";
import type { SocialHubResponse } from "../types/socialHub";
import { invalidateSocialHubCache, readSocialHubCache, writeSocialHubCache } from "../utils/socialHubCache";
import { goiToast } from "../context/GoiToastContext";
import { getErrorMessage } from "../utils/errorMessages";

const BADGE_MIN_REFRESH_MS = 12_000;
const HUB_MIN_REFRESH_MS = 25_000;

const badgeInFlight = { current: false };
const hubInFlight = { current: false };
const followInFlight = new Set<string>();
const lastBadgeRefreshAt = { current: 0 };
const lastHubRefreshAt = { current: 0 };

function hubPatchFromData(data: SocialHubResponse) {
  return {
    hub: data,
    followingIds: data.followingIds ?? [],
    pendingFollowRequests: data.followRequests?.length ?? 0,
  };
}

type SocialHubState = {
  userId: string | null;
  unreadNotifications: number;
  pendingFollowRequests: number;
  hub: SocialHubResponse | null;
  hubLoading: boolean;
  followingIds: string[];
  socialTabFocused: boolean;

  reset: () => void;
  setUserId: (userId: string | null) => void;
  hydrateForUser: (userId: string) => void;
  setSocialTabFocused: (focused: boolean) => void;
  refreshBadge: (opts?: { force?: boolean }) => Promise<void>;
  refreshHub: (opts?: { silent?: boolean; force?: boolean }) => Promise<void>;
  invalidateHub: () => void;
  applyFollowingChange: (targetId: string, following: boolean) => void;
  toggleFollowFor: (targetId: string) => Promise<ToggleFollowResponse | null>;
};

export const useSocialHubStore = create<SocialHubState>((set, get) => ({
  userId: null,
  unreadNotifications: 0,
  pendingFollowRequests: 0,
  hub: null,
  hubLoading: false,
  followingIds: [],
  socialTabFocused: false,

  reset: () => {
    set({
      userId: null,
      unreadNotifications: 0,
      pendingFollowRequests: 0,
      hub: null,
      hubLoading: false,
      followingIds: [],
      socialTabFocused: false,
    });
  },

  setUserId: (userId) => set({ userId }),

  hydrateForUser: (userId) => {
    set({ userId });
    const cached = readSocialHubCache(userId);
    if (cached) set(hubPatchFromData(cached));
    void get().refreshHub({ silent: Boolean(cached) });
    void get().refreshBadge({ force: true });
  },

  setSocialTabFocused: (focused) => set({ socialTabFocused: focused }),

  refreshBadge: async (opts) => {
    const userId = get().userId;
    if (!userId) {
      set({ unreadNotifications: 0, pendingFollowRequests: 0 });
      return;
    }
    const now = Date.now();
    if (!opts?.force && now - lastBadgeRefreshAt.current < BADGE_MIN_REFRESH_MS) return;
    if (badgeInFlight.current) return;

    badgeInFlight.current = true;
    try {
      const [notif, reqs] = await Promise.all([getNotifications(), getPendingFollowRequests()]);
      set({
        unreadNotifications: notif.unreadCount ?? 0,
        pendingFollowRequests: reqs.requests?.length ?? 0,
      });
      lastBadgeRefreshAt.current = Date.now();
    } catch {
      set({ unreadNotifications: 0, pendingFollowRequests: 0 });
    } finally {
      badgeInFlight.current = false;
    }
  },

  refreshHub: async (opts) => {
    const userId = get().userId;
    if (!userId) return;
    const now = Date.now();
    if (!opts?.force && now - lastHubRefreshAt.current < HUB_MIN_REFRESH_MS) return;
    if (hubInFlight.current && !opts?.force) return;

    hubInFlight.current = true;
    if (!opts?.silent) set({ hubLoading: true });
    try {
      const data = await getSocialHub({ lite: true });
      writeSocialHubCache(userId, data);
      set(hubPatchFromData(data));
      lastHubRefreshAt.current = Date.now();
    } catch {
      if (!get().hub) {
        const cached = readSocialHubCache(userId);
        if (cached) set(hubPatchFromData(cached));
      }
    } finally {
      hubInFlight.current = false;
      if (!opts?.silent) set({ hubLoading: false });
    }
  },

  invalidateHub: () => {
    const userId = get().userId;
    if (userId) invalidateSocialHubCache(userId);
  },

  applyFollowingChange: (targetId, following) => {
    set((state) => {
      const followingIds = following
        ? state.followingIds.includes(targetId)
          ? state.followingIds
          : [...state.followingIds, targetId]
        : state.followingIds.filter((id) => id !== targetId);

      const hub = state.hub
        ? {
            ...state.hub,
            followingIds: following
              ? state.hub.followingIds.includes(targetId)
                ? state.hub.followingIds
                : [...state.hub.followingIds, targetId]
              : state.hub.followingIds.filter((id) => id !== targetId),
            followingTotal: following
              ? state.hub.followingTotal + 1
              : Math.max(0, state.hub.followingTotal - 1),
            discoverUsers: state.hub.discoverUsers.map((u) =>
              u.id === targetId ? { ...u, isFollowing: following, followPending: false } : u
            ),
          }
        : state.hub;

      return { followingIds, hub };
    });
  },

  toggleFollowFor: async (targetId) => {
    const userId = get().userId;
    if (!userId || followInFlight.has(targetId)) return null;

    const wasFollowing = get().followingIds.includes(targetId);
    followInFlight.add(targetId);
    get().applyFollowingChange(targetId, !wasFollowing);

    try {
      const res = await toggleFollowApi(targetId);
      const active = res.following || res.status === "active";
      get().applyFollowingChange(targetId, active);

      if (res.pending) {
        set((state) => {
          if (!state.hub) return state;
          return {
            hub: {
              ...state.hub,
              discoverUsers: state.hub.discoverUsers.map((u) =>
                u.id === targetId ? { ...u, isFollowing: false, followPending: true } : u
              ),
            },
          };
        });
      }

      get().invalidateHub();
      void get().refreshHub({ silent: true });
      return res;
    } catch (e) {
      get().applyFollowingChange(targetId, wasFollowing);
      if (e instanceof ApiError && e.status === 429) {
        goiToast("Demasiados follows seguidos. Espera un momento.");
      } else {
        goiToast(getErrorMessage(e, "No se pudo actualizar el follow."));
      }
      return null;
    } finally {
      followInFlight.delete(targetId);
    }
  },
}));
