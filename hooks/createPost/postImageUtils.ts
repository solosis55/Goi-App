import { POST_IMAGE_MAX_FILES } from "../../constants/createPost";
import { uriToPostImageFile, type PostImageUploadFile } from "../../utils/postImage";
import type { PendingPostImageEntry } from "../../utils/postPublishQueue";

export type PendingPostImage = {
  id: string;
  uri: string;
  dataUrl: string;
  sourceUri: string;
  cropSquare: boolean;
  uploadFile?: PostImageUploadFile;
};

function newImageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function imagesFromUris(uris: string[], cropSquare: boolean): Promise<PendingPostImage[]> {
  const out: PendingPostImage[] = [];
  for (const uri of uris) {
    try {
      const uploadFile = await uriToPostImageFile(uri, { cropSquare });
      out.push({
        id: newImageId(),
        uri: uploadFile.uri,
        dataUrl: "",
        sourceUri: uri,
        cropSquare,
        uploadFile,
      });
    } catch {
      /* URI caducada o inaccesible */
    }
  }
  return out;
}

export function pendingImagesFromDataUrls(dataUrls: string[]): PendingPostImage[] {
  return dataUrls.map((dataUrl, i) => ({
    id: `pending-${i}`,
    uri: dataUrl,
    dataUrl,
    sourceUri: dataUrl,
    cropSquare: true,
  }));
}

export function pendingImageEntriesFromImages(images: PendingPostImage[]): PendingPostImageEntry[] {
  return images
    .map((img) => ({
      localUri: (img.sourceUri || img.uri).trim(),
      cropSquare: img.cropSquare ?? true,
    }))
    .filter((entry) => entry.localUri.length > 0);
}

export async function pendingImagesFromEntries(
  entries: PendingPostImageEntry[]
): Promise<PendingPostImage[]> {
  const out: PendingPostImage[] = [];
  for (const entry of entries.slice(0, POST_IMAGE_MAX_FILES)) {
    const batch = await imagesFromUris([entry.localUri], entry.cropSquare);
    out.push(...batch);
  }
  return out;
}
