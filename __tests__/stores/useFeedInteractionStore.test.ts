import { useFeedInteractionStore } from "../../stores/useFeedInteractionStore";

describe("useFeedInteractionStore", () => {
  beforeEach(() => {
    useFeedInteractionStore.setState({
      commentingPostId: null,
      deletingPostId: null,
      commentFieldError: null,
    });
  });

  it("setCommentingPostId abre comentarios en el post indicado", () => {
    useFeedInteractionStore.getState().setCommentingPostId("post-abc");

    expect(useFeedInteractionStore.getState().commentingPostId).toBe("post-abc");
  });

  it("setDeletingPostId marca el post en borrado", () => {
    useFeedInteractionStore.getState().setDeletingPostId("post-del");

    expect(useFeedInteractionStore.getState().deletingPostId).toBe("post-del");
  });

  it("setCommentFieldError guarda el mensaje y clearCommentError lo limpia", () => {
    useFeedInteractionStore.getState().setCommentFieldError({
      postId: "p1",
      message: "El comentario no puede estar vacío",
    });

    expect(useFeedInteractionStore.getState().commentFieldError).toEqual({
      postId: "p1",
      message: "El comentario no puede estar vacío",
    });

    useFeedInteractionStore.getState().clearCommentError();
    expect(useFeedInteractionStore.getState().commentFieldError).toBeNull();
  });

  it("clearCommentError no hace nada si no hay error previo", () => {
    useFeedInteractionStore.getState().clearCommentError();
    expect(useFeedInteractionStore.getState().commentFieldError).toBeNull();
  });
});
