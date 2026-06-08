import {
  countFeedPosts,
  feedScopeEmptyMessage,
  filterMutedTimeline,
  postEligibleForGoldBeam,
} from "../../utils/feedTimeline";
import { mockPost, mockWorkoutEvent } from "../helpers/mockPost";

describe("feedTimeline", () => {
  it("filtra autores silenciados", () => {
    const timeline = [
      { kind: "post" as const, post: mockPost({ userId: "u1" }) },
      { kind: "post" as const, post: mockPost({ id: "p2", userId: "u2" }) },
    ];
    const filtered = filterMutedTimeline(timeline, new Set(["u2"]));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].post.userId).toBe("u1");
  });

  it("cuenta posts en timeline mixto", () => {
    expect(
      countFeedPosts([
        { kind: "post", post: mockPost() },
        { kind: "workout", event: mockWorkoutEvent() },
      ])
    ).toBe(1);
  });

  it("detecta elegibilidad del beam dorado", () => {
    expect(postEligibleForGoldBeam(mockPost({ media: [{ type: "image", url: "/a.jpg" }] }))).toBe(
      true
    );
    expect(postEligibleForGoldBeam(mockPost({ workoutId: "r1" }))).toBe(true);
    expect(postEligibleForGoldBeam(mockPost({ format: "training", sessionId: "s1" }))).toBe(true);
    expect(postEligibleForGoldBeam(mockPost({ hasMedia: true }))).toBe(true);
    expect(postEligibleForGoldBeam(mockPost())).toBe(false);
  });

  it("mensaje vacío según scope", () => {
    expect(feedScopeEmptyMessage("following").title).toContain("red");
    expect(feedScopeEmptyMessage("all").title).toContain("publicaciones");
  });
});
