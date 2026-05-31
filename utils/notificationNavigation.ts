import type { Router } from "expo-router";
import type { FeedNotification } from "../types/post";
import { commentIdFromNotification } from "./notificationDeepLink";

/** Abre el detalle de una publicación (p. ej. desde notificaciones). */
export function navigateToPostDetail(router: Router, postId: string, commentId?: string): void {
  router.push({
    pathname: "/publicacion/[id]",
    params: {
      id: postId,
      ...(commentId ? { comments: "1", focusCommentId: commentId } : {}),
    },
  });
}

/** Navega al destino adecuado para una notificación (post, comentario o perfil). */
export function navigateFromNotification(router: Router, n: FeedNotification): void {
  if (n.postId) {
    navigateToPostDetail(router, n.postId, commentIdFromNotification(n));
    return;
  }
  router.push({ pathname: "/usuario/[id]", params: { id: n.actorUserId } });
}
