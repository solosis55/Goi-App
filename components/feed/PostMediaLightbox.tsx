import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { feedPostMediaRecyclingKey, resolveFeedPostMediaUrl } from "../../utils/feedPostMediaUrl";
import { PostFeedImage } from "./PostFeedImage";

type PostMediaLightboxProps = {
  visible: boolean;
  urls: string[];
  initialIndex: number;
  onClose: () => void;
};

export function PostMediaLightbox({ visible, urls, initialIndex, onClose }: PostMediaLightboxProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;
    const safe = Math.min(urls.length - 1, Math.max(0, initialIndex));
    setIndex(safe);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: width * safe, animated: false });
    });
  }, [visible, initialIndex, urls.length, width]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      setIndex(Math.min(urls.length - 1, Math.max(0, next)));
    },
    [urls.length, width]
  );

  if (!urls.length) return null;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar imagen">
            <Text style={styles.close}>×</Text>
          </Pressable>
          {urls.length > 1 ? (
            <Text style={styles.counter} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {index + 1} / {urls.length}
            </Text>
          ) : (
            <View style={styles.counterSpacer} />
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={styles.scroller}
        >
          {urls.map((url, i) => {
            const resolved = resolveFeedPostMediaUrl(url);
            return (
              <View key={feedPostMediaRecyclingKey(url, `lightbox-${i}`)} style={[styles.page, { width, height }]}>
                {resolved ? (
                  <PostFeedImage
                    url={url}
                    layoutWidth={width}
                    layoutHeight={height}
                    recyclingKey={feedPostMediaRecyclingKey(url, `lightbox-${i}`)}
                    contentFit="contain"
                  />
                ) : (
                  <Text style={styles.fallback}>Imagen no disponible</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 2,
  },
  close: {
    color: "#fff",
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "300",
    width: 44,
  },
  counter: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
  },
  counterSpacer: {
    width: 44,
  },
  scroller: {
    flex: 1,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
  fallback: {
    color: AUTH.muted,
    fontSize: 14,
  },
});
