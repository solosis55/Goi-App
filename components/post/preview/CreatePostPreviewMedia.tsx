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
} from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { POST_IMAGE_MAX_FILES } from "../../../constants/createPost";
import type { PostMediaLayout } from "../../feed/PostMediaCarousel";

type CreatePostPreviewMediaProps = {
  imageUris: string[];
  width: number;
  height: number;
  layout?: PostMediaLayout;
  editorMode?: boolean;
  maxFiles?: number;
  onPressEdit?: () => void;
  onPressAdd?: () => void;
};

export function CreatePostPreviewMedia({
  imageUris,
  width,
  height,
  layout = "bleed",
  editorMode = false,
  maxFiles = POST_IMAGE_MAX_FILES,
  onPressEdit,
  onPressAdd,
}: CreatePostPreviewMediaProps) {
  const uris = useMemo(() => imageUris.filter(Boolean), [imageUris]);
  const [index, setIndex] = useState(0);
  const canAddMore = editorMode && uris.length > 0 && uris.length < maxFiles && onPressAdd;

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / width);
      setIndex(Math.min(uris.length - 1, Math.max(0, next)));
    },
    [uris.length, width]
  );

  if (uris.length === 0) return null;

  const slide = (uri: string, i: number) => (
    <Pressable
      key={`${uri}-${i}`}
      onPress={editorMode ? onPressEdit : undefined}
      disabled={!editorMode || !onPressEdit}
      style={[styles.slide, { width, height }]}
    >
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
    </Pressable>
  );

  return (
    <View
      style={[
        styles.wrap,
        layout === "inset" ? styles.wrapInset : styles.wrapBleed,
        { width, height },
      ]}
    >
      {uris.length === 1 ? (
        slide(uris[0], 0)
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          decelerationRate="fast"
          bounces={false}
          style={{ width, height }}
        >
          {uris.map((uri, i) => slide(uri, i))}
        </ScrollView>
      )}

      {uris.length > 1 ? (
        <View style={styles.countBadge} pointerEvents="none">
          <Text style={styles.countText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {index + 1}/{uris.length}
          </Text>
        </View>
      ) : null}

      {editorMode && onPressEdit ? (
        <View style={styles.editHint} pointerEvents="none">
          <Text style={styles.editHintText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {uris.length > 1 ? "Toca para gestionar fotos" : "Toca para editar foto"}
          </Text>
        </View>
      ) : null}

      {canAddMore ? (
        <Pressable
          onPress={onPressAdd}
          style={[styles.addMoreBtn, uris.length > 1 ? styles.addMoreBtnMulti : null]}
          accessibilityRole="button"
          accessibilityLabel="Añadir otra foto"
        >
          <Text style={styles.addMoreIcon} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            +
          </Text>
          <Text style={styles.addMoreLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Añadir
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#141416",
  },
  wrapBleed: {
    alignSelf: "center",
  },
  wrapInset: {
    alignSelf: "center",
  },
  slide: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  countBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  countText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  editHint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  editHintText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  addMoreBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(35, 32, 22, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.55)",
  },
  addMoreIcon: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  addMoreLabel: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "700",
  },
  addMoreBtnMulti: {
    top: undefined,
    bottom: 10,
  },
});
