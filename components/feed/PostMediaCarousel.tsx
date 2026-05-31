import { memo, useCallback, useMemo, useState } from "react";
import { DoubleTapHeartBurst } from "./DoubleTapHeartBurst";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PostMediaItem } from "../../types/post";
import { feedPostMediaRecyclingKey, resolveFeedPostMediaUrl } from "../../utils/feedPostMediaUrl";
import { PostFeedImage } from "./PostFeedImage";
import { PostMediaLightbox } from "./PostMediaLightbox";

const MAX_CONTENT_WIDTH = 672;

export type PostMediaAspect = "square" | "portrait45";
export type PostMediaLayout = "bleed" | "inset";

function heroHeightForWidth(width: number, aspect: PostMediaAspect): number {
  return aspect === "square" ? width : Math.round(width * (5 / 4));
}

type PostMediaCarouselProps = {
  media: PostMediaItem[];
  onDoubleTapLike?: () => void;
  /** Ancho del carrusel (p. ej. pantalla completa en feed). */
  slideWidth?: number;
  /** Publicación: 1:1. Training: 4:5 (ignorado si slideHeight está definido). */
  mediaAspect?: PostMediaAspect;
  /** Altura fija del slide (p. ej. training compacto en feed). */
  slideHeight?: number;
  /** bleed = ancho completo (publicación). inset = márgenes (training). */
  layout?: PostMediaLayout;
};

type MediaSlideProps = {
  uri: string;
  width: number;
  height: number;
  slideIndex: number;
  onOpenLightbox: (index: number) => void;
  onDoubleTap: () => void;
};

const MediaSlide = memo(function MediaSlide({
  uri,
  width,
  height,
  slideIndex,
  onOpenLightbox,
  onDoubleTap,
}: MediaSlideProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveFeedPostMediaUrl(uri);
  const recyclingKey = feedPostMediaRecyclingKey(uri, String(slideIndex));

  const openLightbox = useCallback(() => {
    onOpenLightbox(slideIndex);
  }, [onOpenLightbox, slideIndex]);

  const tapGestures = useMemo(() => {
    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(280)
      .onEnd(() => {
        runOnJS(onDoubleTap)();
      });

    const singleTap = Gesture.Tap()
      .numberOfTaps(1)
      .maxDuration(280)
      .onEnd(() => {
        runOnJS(openLightbox)();
      });

    return Gesture.Exclusive(doubleTap, singleTap);
  }, [onDoubleTap, openLightbox]);

  if (failed || !resolved) {
    return (
      <View style={[styles.slide, styles.placeholder, { width, height }]}>
        <Text style={styles.placeholderText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          No se pudo cargar la imagen
        </Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={tapGestures}>
      <View
        style={[styles.slide, { width, height }]}
        accessibilityRole="button"
        accessibilityLabel="Ampliar foto. Doble toque para me gusta."
      >
        <PostFeedImage
          url={uri}
          layoutWidth={width}
          layoutHeight={height}
          recyclingKey={recyclingKey}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      </View>
    </GestureDetector>
  );
});

export function PostMediaCarousel({
  media,
  onDoubleTapLike,
  slideWidth: slideWidthProp,
  mediaAspect = "portrait45",
  slideHeight: slideHeightProp,
  layout = "bleed",
}: PostMediaCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = slideWidthProp ?? Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const slideHeight = slideHeightProp ?? heroHeightForWidth(slideWidth, mediaAspect);
  const images = media.filter((m) => m.type === "image" && m.url?.trim());
  const urls = useMemo(() => images.map((m) => m.url), [images]);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [heartBurst, setHeartBurst] = useState(0);

  const handleDoubleTap = useCallback(() => {
    setHeartBurst((n) => n + 1);
    onDoubleTapLike?.();
  }, [onDoubleTapLike]);

  const openLightbox = useCallback((i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  }, []);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / slideWidth);
      setIndex(Math.min(images.length - 1, Math.max(0, next)));
    },
    [images.length, slideWidth]
  );

  if (images.length === 0) return null;

  const slideProps = (item: PostMediaItem, i: number) => ({
    uri: item.url,
    width: slideWidth,
    height: slideHeight,
    slideIndex: i,
    onOpenLightbox: openLightbox,
    onDoubleTap: handleDoubleTap,
  });

  return (
    <>
      <View style={[styles.wrap, layout === "inset" ? styles.wrapInset : styles.wrapBleed]}>
        {images.length === 1 ? (
          <MediaSlide {...slideProps(images[0], 0)} />
        ) : (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              decelerationRate="fast"
              bounces={false}
              style={{ height: slideHeight }}
              keyboardShouldPersistTaps="handled"
            >
              {images.map((item, i) => (
                <MediaSlide key={feedPostMediaRecyclingKey(item.url, String(i))} {...slideProps(item, i)} />
              ))}
            </ScrollView>
            <View style={styles.dots} pointerEvents="none">
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
              ))}
            </View>
            <View style={styles.counter} pointerEvents="none">
              <Text style={styles.counterText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {index + 1}/{images.length}
              </Text>
            </View>
          </>
        )}
        <DoubleTapHeartBurst trigger={heartBurst} />
      </View>

      <PostMediaLightbox
        visible={lightboxOpen}
        urls={urls}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    backgroundColor: "#141416",
    overflow: "hidden",
  },
  wrapBleed: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  wrapInset: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
  },
  slide: {
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#141416",
  },
  placeholderText: {
    color: AUTH.muted,
    fontSize: 13,
  },
  dots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  dotActive: {
    backgroundColor: AUTH.gold,
    width: 8,
  },
  counter: {
    position: "absolute",
    top: 10,
    right: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
  },
  counterText: {
    color: AUTH.neutral100,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
