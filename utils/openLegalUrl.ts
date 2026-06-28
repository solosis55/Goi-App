import { Linking } from "react-native";
import { LEGAL_URLS } from "../constants/legalUrls";

export async function openLegalUrl(kind: keyof typeof LEGAL_URLS): Promise<void> {
  const url = LEGAL_URLS[kind];
  const can = await Linking.canOpenURL(url);
  if (!can) {
    throw new Error("No se pudo abrir el enlace legal");
  }
  await Linking.openURL(url);
}
