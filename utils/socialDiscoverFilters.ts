import type { DiscoverUser } from "../types/auth";
import { isNearbyUser } from "./socialDiscoverSort";

export type DiscoverFacetFilter = "all" | "active" | "trained" | "sameGoal" | "nearby";

export const DISCOVER_FACET_OPTIONS: { id: DiscoverFacetFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Activos" },
  { id: "trained", label: "Entrenaron" },
  { id: "sameGoal", label: "Misma meta" },
  { id: "nearby", label: "Cerca" },
];

function norm(s: string | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

export function applyDiscoverFacet(
  users: DiscoverUser[],
  facet: DiscoverFacetFilter,
  viewerGoal: string | undefined,
  viewerLocation: string | undefined
): DiscoverUser[] {
  switch (facet) {
    case "active":
      return users.filter((u) => u.activeThisWeek);
    case "trained":
      return users.filter((u) => u.trainedThisWeek);
    case "sameGoal": {
      const g = norm(viewerGoal);
      if (!g) return [];
      return users.filter((u) => norm(u.goal) === g);
    }
    case "nearby":
      return users.filter((u) => isNearbyUser(viewerLocation, u));
    default:
      return users;
  }
}
