import {
  buildFeedListItems,
  countPostsInList,
  feedListIndexForPostId,
} from "../../utils/feedListItems";
import { mockPost } from "../helpers/mockPost";

describe("feedListItems", () => {
  it("inserta separadores de día y sugerencias inline", () => {
    const items = buildFeedListItems(
      [
        { kind: "post", post: mockPost({ id: "p1", createdAt: "2026-05-26T10:00:00.000Z" }) },
        { kind: "post", post: mockPost({ id: "p2", createdAt: "2026-05-26T11:00:00.000Z" }) },
        { kind: "post", post: mockPost({ id: "p3", createdAt: "2026-05-27T09:00:00.000Z" }) },
      ],
      { insertSuggestions: true, suggestionsAfterPostCount: 2 }
    );

    expect(items.some((i) => i.kind === "day")).toBe(true);
    expect(items.some((i) => i.kind === "suggestions")).toBe(true);
    expect(countPostsInList(items)).toBe(3);
  });

  it("encuentra índice de post por id", () => {
    const items = buildFeedListItems([
      { kind: "post", post: mockPost({ id: "p9", createdAt: "2026-05-26T10:00:00.000Z" }) },
    ]);
    expect(feedListIndexForPostId(items, "p9")).toBe(1);
    expect(feedListIndexForPostId(items, "missing")).toBe(-1);
  });
});
