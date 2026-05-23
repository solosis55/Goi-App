import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

const AVATAR_MAX = 512;
const BANNER_MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.85;

function imageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

async function toJpegUri(uri: string, maxDimension: number): Promise<string> {
  const { width, height } = await imageSize(uri);
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const actions = scale < 1 ? [{ resize: { width: targetWidth } } as const] : [];

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
}

export type PickProfileImageResult =
  | { ok: true; uri: string; mimeType: "image/jpeg" }
  | { ok: false; cancelled: true }
  | { ok: false; error: string };

/** Elige y comprime imagen de perfil (recorte 1:1 avatar, 3:1 cabecera). */
export async function pickProfileImage(kind: "avatar" | "banner"): Promise<PickProfileImageResult> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    return { ok: false, error: "Necesitamos acceso a tus fotos." };
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: kind === "avatar" ? [1, 1] : [3, 1],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return { ok: false, cancelled: true };
    }

    const maxDim = kind === "avatar" ? AVATAR_MAX : BANNER_MAX_WIDTH;
    const uri = await toJpegUri(result.assets[0].uri, maxDim);
    return { ok: true, uri, mimeType: "image/jpeg" };
  } catch {
    return { ok: false, error: "No se pudo preparar la imagen." };
  }
}
