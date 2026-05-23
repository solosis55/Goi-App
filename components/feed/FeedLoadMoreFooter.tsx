import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { FeedPostCardSkeleton } from "./FeedPostCardSkeleton";

type FeedLoadMoreFooterProps = {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

export function FeedLoadMoreFooter({ hasMore, loadingMore, onLoadMore }: FeedLoadMoreFooterProps) {
  if (!hasMore) return <View style={styles.spacer} />;

  if (loadingMore) {
    return (
      <View style={styles.skeletonWrap}>
        <FeedPostCardSkeleton count={1} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onLoadMore}
      style={({ pressed }) => [styles.btn, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel="Cargar más publicaciones"
    >
      <Text style={styles.btnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Cargar más publicaciones
      </Text>
    </Pressable>
  );
}

export function FeedEndReachedSpinner() {
  return (
    <View style={styles.inlineLoader}>
      <ActivityIndicator color={AUTH.gold} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  spacer: {
    height: 8,
  },
  skeletonWrap: {
    marginTop: 4,
    marginBottom: 8,
  },
  btn: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(20, 18, 14, 0.6)",
  },
  btnText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
  inlineLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
