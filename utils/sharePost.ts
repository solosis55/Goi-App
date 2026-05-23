import { Platform, Share } from "react-native";
import { goiToast } from "../context/GoiToastContext";

export async function sharePost(postId: string, authorUsername: string, preview: string): Promise<void> {
  const snippet = preview.trim().slice(0, 80);
  const message = snippet
    ? `Publicación de @${authorUsername} en GoI: «${snippet}${preview.trim().length > 80 ? "…" : ""}»`
    : `Publicación de @${authorUsername} en GoI`;

  try {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "GoI", text: message });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        goiToast("Enlace copiado al portapapeles");
        return;
      }
    }
    await Share.share({ message, title: "GoI" }, { dialogTitle: "Compartir publicación" });
  } catch {
    /* cancelado */
  }
}
