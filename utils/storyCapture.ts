import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

const STORY_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 1,
};

export type StoryCaptureResult =
  | { ok: true; uri: string }
  | { ok: false; cancelled: true }
  | { ok: false; error: string };

async function launchPicker(
  launcher: () => Promise<ImagePicker.ImagePickerResult>
): Promise<StoryCaptureResult> {
  try {
    const result = await launcher();
    if (result.canceled || !result.assets[0]?.uri) {
      return { ok: false, cancelled: true };
    }
    return { ok: true, uri: result.assets[0].uri };
  } catch {
    return { ok: false, error: "No se pudo obtener la imagen." };
  }
}

/** Abre la cámara del sistema (recorte 1:1). En web no hay cámara nativa fiable. */
export async function captureStoryPhotoFromCamera(): Promise<StoryCaptureResult> {
  if (Platform.OS === "web") {
    return {
      ok: false,
      error: "La cámara no está disponible en la versión web. Usa la galería.",
    };
  }

  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    return { ok: false, error: "Necesitamos permiso de cámara para publicar GoI Daily." };
  }

  return launchPicker(() => ImagePicker.launchCameraAsync(STORY_PICKER_OPTIONS));
}

/** Abre el carrete de fotos. */
export async function pickStoryPhotoFromLibrary(): Promise<StoryCaptureResult> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    return { ok: false, error: "Necesitamos acceso a tus fotos para publicar GoI Daily." };
  }

  return launchPicker(() => ImagePicker.launchImageLibraryAsync(STORY_PICKER_OPTIONS));
}
