import type { DiscoverUser } from "../types/auth";
import { NEARBY_MAX_KM, viewerHasDiscoverLocation, type GeoPoint } from "./geoNearby";

export type DiscoverSortMode = "recommended" | "mutuals" | "active" | "nearby" | "sameGoal";

export const DISCOVER_SORT_OPTIONS: { id: DiscoverSortMode; label: string }[] = [
  { id: "recommended", label: "Recomendados" },
  { id: "mutuals", label: "Más en común" },
  { id: "active", label: "Activos" },
  { id: "sameGoal", label: "Misma meta" },
  { id: "nearby", label: "Cerca" },
];

function normLocation(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function normGoal(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function isNearbyUser(viewer: GeoPoint | undefined, user: DiscoverUser): boolean {
  if (!viewerHasDiscoverLocation(viewer)) return false;
  if (user.nearby) return true;
  if (typeof user.distanceKm === "number" && user.distanceKm <= NEARBY_MAX_KM) return true;
  const vl = normLocation(viewer?.location);
  if (!vl) return false;
  const ul = normLocation(user.location);
  if (ul && (ul === vl || ul.includes(vl) || vl.includes(ul))) return true;
  const reason = (user.reason ?? "").toLowerCase();
  return reason.includes(" km") || reason.includes("cerca");
}

export function sortDiscoverUsers(
  users: DiscoverUser[],
  mode: DiscoverSortMode,
  opts?: { viewer?: GeoPoint; viewerGoal?: string }
): DiscoverUser[] {
  const list = [...users];
  const viewer = opts?.viewer;
  const viewerGoal = opts?.viewerGoal;

  switch (mode) {
    case "mutuals":
      return list.sort((a, b) => (b.mutualCount ?? 0) - (a.mutualCount ?? 0));
    case "active":
      return list.sort((a, b) => {
        const da = a.activeThisWeek ? 1 : 0;
        const db = b.activeThisWeek ? 1 : 0;
        if (db !== da) return db - da;
        return (b.mutualCount ?? 0) - (a.mutualCount ?? 0);
      });
    case "nearby":
      return list
        .filter((u) => isNearbyUser(viewer, u))
        .sort((a, b) => {
          const da = a.distanceKm ?? 9999;
          const db = b.distanceKm ?? 9999;
          if (da !== db) return da - db;
          return (b.mutualCount ?? 0) - (a.mutualCount ?? 0);
        });
    case "sameGoal": {
      const g = normGoal(viewerGoal);
      if (!g) return [];
      return list
        .filter((u) => normGoal(u.goal) === g)
        .sort((a, b) => (b.mutualCount ?? 0) - (a.mutualCount ?? 0));
    }
    default:
      return list;
  }
}
