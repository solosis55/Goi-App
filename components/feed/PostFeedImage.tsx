import { Image, type ImageContentFit, type ImageStyle } from "expo-image";
import { memo } from "react";
import { PixelRatio, StyleSheet, type StyleProp } from "react-native";
import { feedPostMediaRecyclingKey, feedPostMediaUsesInlineData, resolveFeedPostMediaUrl } from "../../utils/feedPostMediaUrl";

export type PostFeedImageProps = {
  url: string;
  layoutWidth: number;
  layoutHeight: number;
  recyclingKey?: string;
  contentFit?: ImageContentFit;
  style?: StyleProp<ImageStyle>;
  onError?: () => void;
};

function PostFeedImageInner({
  url,
  layoutWidth,
  layoutHeight,
  recyclingKey,
  contentFit = "cover",
  style,
  onError,
}: PostFeedImageProps) {
  const resolved = resolveFeedPostMediaUrl(url);
  if (!resolved) return null;

  const pixelWidth = Math.max(1, Math.ceil(layoutWidth * PixelRatio.get()));
  const pixelHeight = Math.max(1, Math.ceil(layoutHeight * PixelRatio.get()));
  const inlineData = feedPostMediaUsesInlineData(url);

  return (
    <Image
      source={
        inlineData
          ? { uri: resolved }
          : { uri: resolved, width: pixelWidth, height: pixelHeight }
      }
      style={[styles.fill, style]}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      recyclingKey={recyclingKey ?? feedPostMediaRecyclingKey(url)}
      transition={0}
      allowDownscaling
      accessibilityIgnoresInvertColors
      onError={onError}
    />
  );
}

export const PostFeedImage = memo(PostFeedImageInner);

const styles = StyleSheet.create({
  fill: {
    width: "100%",
    height: "100%",
  },
});
