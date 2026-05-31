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

/** Redimensiona y devuelve data URL JPEG para `POST /posts`. */
export async function uriToPostImageDataUrl(
  uri: string,
  opts?: { cropSquare?: boolean }
): Promise<string> {
  const { width, height } = await imageSize(uri);
  const actions: ImageManipulator.Action[] = [];

  if (opts?.cropSquare) {
    const side = Math.min(width, height);
    const originX = Math.floor((width - side) / 2);
    const originY = Math.floor((height - side) / 2);
    actions.push({ crop: { originX, originY, width: side, height: side } });
  }

  const w = opts?.cropSquare ? Math.min(width, height) : width;
  const h = opts?.cropSquare ? Math.min(width, height) : height;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
  const targetWidth = Math.max(1, Math.round(w * scale));

  if (scale < 1) {
    actions.push({ resize: { width: targetWidth } });
  }

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

/** Toma una foto con la cámara (una por llamada). */
export async function takePostPhoto(): Promise<PickPostImagesResult> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    return { ok: false, error: "Necesitamos acceso a la cámara." };
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return { ok: false, cancelled: true };
    }

    return { ok: true, uris: [result.assets[0].uri] };
  } catch {
    return { ok: false, error: "No se pudo usar la cámara." };
  }
}

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
