import type { DiscoverUser } from "../types/auth";
import { isNearbyUser } from "./socialDiscoverSort";
import type { GeoPoint } from "./geoNearby";

const HIGHLIGHT_MAX = 6;

export type SocialDiscoverGroups = {
  mutuals: DiscoverUser[];
  activeThisWeek: DiscoverUser[];
  rest: DiscoverUser[];
};

function notSelfNorFollowing(u: DiscoverUser, currentUserId: string | undefined, followingIds: string[]) {
  return u.id !== currentUserId && !followingIds.includes(u.id);
}

export function groupDiscoverUsers(
  users: DiscoverUser[],
  currentUserId: string | undefined,
  followingIds: string[]
): SocialDiscoverGroups {
  const eligible = users.filter((u) => notSelfNorFollowing(u, currentUserId, followingIds));

  const mutuals = eligible
    .filter((u) => (u.mutualCount ?? 0) > 0)
    .sort((a, b) => (b.mutualCount ?? 0) - (a.mutualCount ?? 0))
    .slice(0, HIGHLIGHT_MAX);

  const mutualIds = new Set(mutuals.map((u) => u.id));

  const activeThisWeek = eligible
    .filter((u) => u.activeThisWeek && !mutualIds.has(u.id))
    .slice(0, HIGHLIGHT_MAX);

  const highlightIds = new Set([...mutualIds, ...activeThisWeek.map((u) => u.id)]);

  const rest = eligible.filter((u) => !highlightIds.has(u.id));

  return { mutuals, activeThisWeek, rest };
}

export function pickFollowBackUsers(
  followerIds: string[],
  followingIds: string[],
  pool: DiscoverUser[],
  max = 8
): DiscoverUser[] {
  const backIds = followerIds.filter((id) => !followingIds.includes(id));
  const byId = new Map(pool.map((u) => [u.id, u]));
  const out: DiscoverUser[] = [];
  for (const id of backIds) {
    const u = byId.get(id);
    if (u) out.push(u);
    if (out.length >= max) break;
  }
  return out;
}

export function pickNearbyUsers(
  users: DiscoverUser[],
  viewer: GeoPoint | undefined,
  max = 8
): DiscoverUser[] {
  return users
    .filter((u) => isNearbyUser(viewer, u))
    .sort((a, b) => {
      const da = a.distanceKm ?? 9999;
      const db = b.distanceKm ?? 9999;
      if (da !== db) return da - db;
      return (b.mutualCount ?? 0) - (a.mutualCount ?? 0);
    })
    .slice(0, max);
}

export function filterUsersBySearch(users: DiscoverUser[], query: string): DiscoverUser[] {
  const q = query.trim().toLowerCase().replace(/^@/, "");
  if (!q) return users;
  return users.filter((u) => u.username.toLowerCase().includes(q));
}
