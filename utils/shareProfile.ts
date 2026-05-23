import { Platform, Share } from "react-native";
import { goiAlert } from "../context/GoiAlertContext";
import { buildProfileShareContent } from "./profileShare";

export async function shareProfile(username: string, userId: string): Promise<boolean> {
  const { title, message, url } = buildProfileShareContent(username, userId);

  try {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text: message, url });
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        goiAlert({
          title: "Goi",
          message: "Enlace copiado al portapapeles.",
          buttons: [{ text: "Entendido", style: "cancel" }],
        });
        return true;
      }
      goiAlert({
        title: "Goi",
        message,
        buttons: [{ text: "Entendido", style: "cancel" }],
      });
      return false;
    }

    const result = await Share.share(
      url ? { title, message, url } : { title, message },
      { dialogTitle: title, subject: title }
    );
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}
