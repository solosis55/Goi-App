import {
  applyLikeToggle,
  buildOptimisticComment,
  reconcileLikeFromServer,
} from "../../utils/postInteractionLogic";

describe("postInteractionLogic", () => {
  describe("applyLikeToggle", () => {
    it("incrementa likes al dar like", () => {
      expect(applyLikeToggle({ likedByMe: false, likesCount: 3 }, true)).toEqual({
        likedByMe: true,
        likesCount: 4,
      });
    });

    it("decrementa likes al quitar like", () => {
      expect(applyLikeToggle({ likedByMe: true, likesCount: 1 }, false)).toEqual({
        likedByMe: false,
        likesCount: 0,
      });
    });
  });

  describe("reconcileLikeFromServer", () => {
    it("ajusta contador según snapshot previo al servidor", () => {
      const snapshot = { likedByMe: false, likesCount: 2 };
      expect(reconcileLikeFromServer(snapshot, true)).toEqual({
        likedByMe: true,
        likesCount: 3,
      });
    });
  });

  describe("buildOptimisticComment", () => {
    it("genera comentario temporal con autor", () => {
      const c = buildOptimisticComment({
        tempId: "temp-1",
        postId: "p1",
        userId: "u1",
        username: "cris",
        content: "Hola",
      });
      expect(c.id).toBe("temp-1");
      expect(c.authorUsername).toBe("cris");
      expect(c.content).toBe("Hola");
    });
  });
});
