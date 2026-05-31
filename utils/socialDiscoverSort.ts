import type { DiscoverUser } from "../types/auth";

export type DiscoverSortMode = "recommended" | "mutuals" | "active" | "nearby" | "sameGoal";

export const DISCOVER_SORT_OPTIONS: { id: DiscoverSortMode; label: string }[] = [
  { id: "recommended", label: "Recomendados" },
  { id: "mutuals", label: "Más en común" },
  { id: "active", label: "Activos" },
  { id: "sameGoal", label: "Misma meta" },
  { id: "nearby", label: "Cerca" },
];

function normLocation(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function normGoal(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function isNearbyUser(viewerLocation: string | undefined, user: DiscoverUser): boolean {
  const vl = normLocation(viewerLocation);
  if (!vl) return false;
  const ul = normLocation(user.location);
  if (ul && ul === vl) return true;
  return (user.reason ?? "").toLowerCase().includes("cerca");
}

export function sortDiscoverUsers(
  users: DiscoverUser[],
  mode: DiscoverSortMode,
  opts?: { viewerLocation?: string; viewerGoal?: string }
): DiscoverUser[] {
  const list = [...users];
  const viewerLocation = opts?.viewerLocation;
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
        .filter((u) => isNearbyUser(viewerLocation, u))
        .sort((a, b) => (b.mutualCount ?? 0) - (a.mutualCount ?? 0));
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
