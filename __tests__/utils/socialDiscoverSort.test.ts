import type { DiscoverUser } from "../../types/auth";
import { isNearbyUser, sortDiscoverUsers } from "../../utils/socialDiscoverSort";

function discoverUser(partial: Partial<DiscoverUser> & Pick<DiscoverUser, "id">): DiscoverUser {
  return {
    username: "atleta",
    bio: "",
    goal: "",
    avatarUrl: "",
    bannerUrl: "",
    bannerShowInFeed: true,
    websiteUrl: "",
    instagramUrl: "",
    stravaUrl: "",
    location: "",
    profileVisibility: "public",
    profileSections: {
      bio: "public",
      stats: "public",
      sessions: "public",
      socialLists: "public",
    },
    discoverable: true,
    requireAuthToView: false,
    defaultPostVisibility: "public",
    pinnedPostId: "",
    createdAt: "",
    updatedAt: "",
    isFollowing: false,
    ...partial,
  };
}

describe("socialDiscoverSort", () => {
  describe("isNearbyUser", () => {
    it("devuelve true si el servidor marcó nearby con GPS", () => {
      const viewer = { hasGeoLocation: true, location: "Madrid" };
      const user = discoverUser({ id: "u1", nearby: true, distanceKm: 12 });

      expect(isNearbyUser(viewer, user)).toBe(true);
    });

    it("empareja por texto de ubicación si no hay GPS", () => {
      const viewer = { location: "Madrid, España" };
      const user = discoverUser({ id: "u2", location: "madrid" });

      expect(isNearbyUser(viewer, user)).toBe(true);
    });

    it("devuelve false si el viewer no tiene ubicación", () => {
      const user = discoverUser({ id: "u3", location: "Barcelona" });

      expect(isNearbyUser(undefined, user)).toBe(false);
    });
  });

  describe("sortDiscoverUsers", () => {
    it("ordena por mutualCount en modo mutuals", () => {
      const users = [
        discoverUser({ id: "a", mutualCount: 1 }),
        discoverUser({ id: "b", mutualCount: 5 }),
        discoverUser({ id: "c", mutualCount: 3 }),
      ];

      const sorted = sortDiscoverUsers(users, "mutuals");

      expect(sorted.map((u) => u.id)).toEqual(["b", "c", "a"]);
    });

    it("filtra por misma meta en modo sameGoal", () => {
      const users = [
        discoverUser({ id: "a", goal: "Fuerza" }),
        discoverUser({ id: "b", goal: "Resistencia" }),
      ];

      const sorted = sortDiscoverUsers(users, "sameGoal", { viewerGoal: "fuerza" });

      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe("a");
    });
  });
});
