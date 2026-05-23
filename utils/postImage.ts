import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { POST_IMAGE_MAX_FILES } from "../constants/createPost";

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

function imageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

/** Redimensiona y devuelve data URL JPEG para `POST /posts` (sin recorte forzado). */
export async function uriToPostImageDataUrl(uri: string): Promise<string> {
  const { width, height } = await imageSize(uri);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));

  const actions =
    scale < 1 ? [{ resize: { width: targetWidth } } as const] : [];

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64) {
    throw new Error("No se pudo codificar la imagen");
  }

  return `data:image/jpeg;base64,${result.base64}`;
}

export type PickPostImagesResult =
  | { ok: true; uris: string[] }
  | { ok: false; cancelled: true }
  | { ok: false; error: string };

/** Elige hasta `maxCount` fotos del carrete (sin recorte del sistema). */
export async function pickPostImages(maxCount: number): Promise<PickPostImagesResult> {
  const limit = Math.min(Math.max(1, maxCount), POST_IMAGE_MAX_FILES);
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    return { ok: false, error: "Necesitamos acceso a tus fotos." };
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: limit > 1,
      selectionLimit: limit,
      quality: 1,
    });

    if (result.canceled || !result.assets.length) {
      return { ok: false, cancelled: true };
    }

    const uris = result.assets.map((a) => a.uri).filter(Boolean) as string[];
    if (!uris.length) {
      return { ok: false, cancelled: true };
    }

    return { ok: true, uris: uris.slice(0, limit) };
  } catch {
    return { ok: false, error: "No se pudieron elegir las fotos." };
  }
}
