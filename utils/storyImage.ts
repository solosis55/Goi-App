import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";

/** Tope orientativo del servidor (~360k chars por imagen). */
const STORY_MAX_WIDTH = 1080;
const STORY_JPEG_QUALITY = 0.72;

function imageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

/** Recorte cuadrado centrado + compresión JPEG para el API de historias. */
export async function uriToStoryDataUrl(uri: string): Promise<string> {
  const { width, height } = await imageSize(uri);
  const side = Math.min(width, height);
  const originX = Math.round((width - side) / 2);
  const originY = Math.round((height - side) / 2);

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      { crop: { originX, originY, width: side, height: side } },
      { resize: { width: STORY_MAX_WIDTH } },
    ],
    {
      compress: STORY_JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!result.base64) {
    throw new Error("No se pudo codificar la imagen");
  }

  return `data:image/jpeg;base64,${result.base64}`;
}
