import { Platform } from "react-native";
import type { Router } from "expo-router";
import type { Post } from "../types/post";
import {
  setOpeningProfilePost,
  type ProfilePostOpeningMeta,
} from "./profilePostDetailSession";

type OpenProfilePostDetailOptions = {
  router: Router;
  post: Post;
  /** Pantalla de detalle con acciones de perfil propio (editar, fijar, etc.). */
  ownProfile?: boolean;
  openingMeta?: ProfilePostOpeningMeta;
  onOpenModal: () => void;
};

/** En Android abre pantalla dedicada; en iOS usa el modal del perfil. */
export function openProfilePostDetail({
  router,
  post,
  ownProfile,
  openingMeta,
  onOpenModal,
}: OpenProfilePostDetailOptions): void {
  if (Platform.OS === "android") {
    setOpeningProfilePost(post, openingMeta);
    router.push({
      pathname: "/publicacion/[id]",
      params: { id: post.id, ...(ownProfile ? { own: "1" } : {}) },
    });
    return;
  }
  onOpenModal();
}

export function usesProfilePostDetailScreen(): boolean {
  return Platform.OS === "android";
}
