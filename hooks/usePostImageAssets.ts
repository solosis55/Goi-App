import { useCallback, useState } from "react";
import { InteractionManager } from "react-native";
import { POST_IMAGE_MAX_FILES } from "../constants/createPost";
import {
  pickPostImages,
  takePostPhoto,
  uriToPostImageFile,
  type PickPostImagesResult,
} from "../utils/postImage";
import { imagesFromUris, type PendingPostImage } from "./createPost/postImageUtils";

export function usePostImageAssets(onError?: (message: string) => void) {
  const [images, setImages] = useState<PendingPostImage[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);

  const pickImages = useCallback(async (): Promise<PickPostImagesResult> => {
    if (mediaBusy || images.length >= POST_IMAGE_MAX_FILES) {
      return { ok: false, cancelled: true };
    }
    const slots = POST_IMAGE_MAX_FILES - images.length;
    return pickPostImages(slots);
  }, [images.length, mediaBusy]);

  const pickCamera = useCallback(async (): Promise<PickPostImagesResult> => {
    if (mediaBusy || images.length >= POST_IMAGE_MAX_FILES) {
      return { ok: false, cancelled: true };
    }
    return takePostPhoto();
  }, [images.length, mediaBusy]);

  const appendUris = useCallback(
    async (uris: string[], cropSquare: boolean) => {
      if (!uris.length || mediaBusy) return;
      setMediaBusy(true);
      try {
        await new Promise<void>((resolve) => {
          InteractionManager.runAfterInteractions(() => resolve());
        });
        const next = await imagesFromUris(uris, cropSquare);
        if (next.length === 0) {
          onError?.("No se pudo procesar una o más imágenes.");
          return;
        }
        setImages((prev) => [...prev, ...next].slice(0, POST_IMAGE_MAX_FILES));
      } finally {
        setMediaBusy(false);
      }
    },
    [mediaBusy, onError]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const toggleImageCrop = useCallback(
    async (id: string) => {
      const img = images.find((i) => i.id === id);
      if (!img || mediaBusy) return;
      setMediaBusy(true);
      try {
        const nextCrop = !img.cropSquare;
        const uploadFile = await uriToPostImageFile(img.sourceUri, { cropSquare: nextCrop });
        setImages((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, cropSquare: nextCrop, uri: uploadFile.uri, dataUrl: "", uploadFile }
              : i
          )
        );
      } catch {
        onError?.("No se pudo recortar la imagen.");
      } finally {
        setMediaBusy(false);
      }
    },
    [images, mediaBusy, onError]
  );

  const moveImage = useCallback((id: string, direction: -1 | 1) => {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);
      if (index < 0) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }, []);

  const clearImages = useCallback(() => setImages([]), []);

  return {
    images,
    setImages,
    mediaBusy,
    pickImages,
    pickCamera,
    appendUris,
    removeImage,
    toggleImageCrop,
    moveImage,
    clearImages,
  };
}
