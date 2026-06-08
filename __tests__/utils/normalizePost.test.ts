import { normalizePost } from "../../utils/normalizePost";
import { mockPost } from "../helpers/mockPost";

describe("normalizePost", () => {
  it("rellena authorUsername vacío", () => {
    const post = normalizePost(mockPost({ authorUsername: "  " }));
    expect(post.authorUsername).toBe("Usuario");
  });

  it("marca hasMedia cuando hay media en el payload", () => {
    const post = normalizePost(
      mockPost({
        media: [{ type: "image", url: "/uploads/posts/p1.jpg" }],
      })
    );
    expect(post.hasMedia).toBe(true);
    expect(post.media).toHaveLength(1);
  });

  it("marca hasMedia desde has_media legacy del servidor", () => {
    const raw = mockPost({ hasMedia: undefined });
    const post = normalizePost({
      ...raw,
      has_media: true,
    } as typeof raw & { has_media: boolean });
    expect(post.hasMedia).toBe(true);
  });

  it("elimina data URLs del feed tras normalizar", () => {
    const post = normalizePost(
      mockPost({
        media: [
          { type: "image", url: "data:image/jpeg;base64,abc" },
          { type: "image", url: "/uploads/posts/p2.jpg" },
        ],
      })
    );
    expect(post.media).toHaveLength(1);
    expect(post.media?.[0]?.url).toBe("/uploads/posts/p2.jpg");
    expect(post.hasMedia).toBe(true);
  });
});
