import { Platform } from "react-native";
import { API_BASE_URL } from "../api/config";
import { getAuthToken } from "../api/session";
import { resolveFeedPostMediaUrl } from "./feedPostMediaUrl";

export type PostFeedImageSource = {
  uri: string;
  headers?: Record<string, string>;
};

export function postMediaStreamUrl(postId: string, mediaIndex: number): string {
  return `${API_BASE_URL}/posts/${encodeURIComponent(postId)}/media/${mediaIndex}`;
}

/**
 * En móvil: JPEG por API autenticada (misma ruta que abre bien en Chrome).
 * En web: `/uploads/...` resuelto al origen del servidor.
 */
export async function resolvePostFeedImageSource(
  postId: string | undefined,
  url: string,
  mediaIndex: number,
  mode: "stream" | "uploads" = "stream"
): Promise<PostFeedImageSource | null> {
  const uploadsUri = resolveFeedPostMediaUrl(url);

  if (Platform.OS === "web" || mode === "uploads") {
    return uploadsUri ? { uri: uploadsUri } : null;
  }

  if (mode === "stream" && postId) {
    const token = await getAuthToken();
    return {
      uri: postMediaStreamUrl(postId, mediaIndex),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    };
  }

  return uploadsUri ? { uri: uploadsUri } : null;
}
