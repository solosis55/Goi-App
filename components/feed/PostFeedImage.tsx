import { memo, useEffect, useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { resolveFeedPostMediaUrl } from "../../utils/feedPostMediaUrl";
import { withMediaCacheBuster } from "../../utils/mediaCacheBuster";

export type PostFeedImageProps = {
  postId?: string;
  mediaIndex?: number;
  url: string;
  layoutWidth: number;
  layoutHeight: number;
  contentFit?: "cover" | "contain" | "fill";
  style?: StyleProp<ImageStyle>;
  onError?: () => void;
};

function resizeModeFromContentFit(fit: "cover" | "contain" | "fill"): ImageResizeMode {
  if (fit === "contain") return "contain";
  if (fit === "fill") return "stretch";
  return "cover";
}

function PostFeedImageInner({
  postId,
  mediaIndex = 0,
  url,
  layoutWidth,
  layoutHeight,
  contentFit = "cover",
  style,
  onError,
}: PostFeedImageProps) {
  const [errorBust, setErrorBust] = useState(0);
  const [failed, setFailed] = useState(false);

  const resolvedUri = useMemo(() => resolveFeedPostMediaUrl(url), [url]);
  const displayUri = useMemo(
    () => (resolvedUri ? withMediaCacheBuster(resolvedUri, errorBust) : null),
    [resolvedUri, errorBust]
  );

  const w = Math.max(1, Math.round(layoutWidth));
  const h = Math.max(1, Math.round(layoutHeight));

  useEffect(() => {
    setFailed(false);
    setErrorBust(0);
  }, [url, postId, mediaIndex]);

  if (!displayUri || failed) {
    return (
      <View style={[styles.box, styles.fail, { width: w, height: h }]}>
        <Text style={styles.failText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          No se pudo cargar la foto
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.box, { width: w, height: h }]}>
      <Image
        key={`${postId ?? "p"}-${mediaIndex}-${errorBust}`}
        source={{ uri: displayUri }}
        style={[{ width: w, height: h }, style]}
        resizeMode={resizeModeFromContentFit(contentFit)}
        onLoad={() => setFailed(false)}
        onError={() => {
          if (errorBust < 2) {
            setErrorBust((n) => n + 1);
            return;
          }
          setFailed(true);
          onError?.();
        }}
      />
    </View>
  );
}

export const PostFeedImage = memo(PostFeedImageInner);

const styles = StyleSheet.create({
  box: {
    overflow: "hidden",
    backgroundColor: "#1c1c1f",
  },
  fail: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  failText: {
    color: AUTH.muted,
    fontSize: 13,
    textAlign: "center",
  },
});
