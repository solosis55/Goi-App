import { useCallback, useMemo, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PostMediaItem } from "../../types/post";
import { useSingleDoubleTap } from "../../utils/useSingleDoubleTap";
import { PostMediaLightbox } from "./PostMediaLightbox";

const MAX_CONTENT_WIDTH = 672;

function heroHeightForWidth(width: number): number {
  return Math.round(width * (5 / 4));
}

type PostMediaCarouselProps = {
  media: PostMediaItem[];
  onDoubleTapLike?: () => void;
};

function CarouselSlide({
  uri,
  width,
  height,
  onPress,
}: {
  uri: string;
  width: number;
  height: number;
  onPress: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(uri);

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
    <Pressable
      onPress={onPress}
      style={[styles.slide, { width, height }]}
      accessibilityRole="button"
      accessibilityLabel="Ampliar foto. Doble toque para me gusta."
    >
      <Image
        source={{ uri: resolved }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    </Pressable>
  );
}

function TappableSlide({
  uri,
  width,
  height,
  slideIndex,
  onOpenLightbox,
  onDoubleTapLike,
}: {
  uri: string;
  width: number;
  height: number;
  slideIndex: number;
  onOpenLightbox: (index: number) => void;
  onDoubleTapLike?: () => void;
}) {
  const onPress = useSingleDoubleTap(
    () => onOpenLightbox(slideIndex),
    () => onDoubleTapLike?.(),
  );

  return <CarouselSlide uri={uri} width={width} height={height} onPress={onPress} />;
}

export function PostMediaCarousel({ media, onDoubleTapLike }: PostMediaCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const slideHeight = heroHeightForWidth(slideWidth);
  const images = media.filter((m) => m.type === "image" && m.url?.trim());
  const urls = useMemo(() => images.map((m) => m.url), [images]);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  return (
    <>
      <View style={styles.wrap}>
        {images.length === 1 ? (
          <TappableSlide
            uri={images[0].url}
            width={slideWidth}
            height={slideHeight}
            slideIndex={0}
            onOpenLightbox={openLightbox}
            onDoubleTapLike={onDoubleTapLike}
          />
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
            >
              {images.map((item, i) => (
                <TappableSlide
                  key={`${item.url}-${i}`}
                  uri={item.url}
                  width={slideWidth}
                  height={slideHeight}
                  slideIndex={i}
                  onOpenLightbox={openLightbox}
                  onDoubleTapLike={onDoubleTapLike}
                />
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
  },
  slide: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
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
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  counterText: {
    color: AUTH.neutral100,
    fontSize: 11,
    fontWeight: "600",
  },
});
