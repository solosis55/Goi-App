import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH } from "../../constants/authUi";
import { FeedHeartIcon } from "./FeedHeartIcon";

type FeedLikeButtonProps = {
  liked: boolean;
  likesCount: number;
  loading?: boolean;
  onPress: () => void;
};

export function FeedLikeButton({ liked, likesCount, loading, onPress }: FeedLikeButtonProps) {
  const color = liked ? AUTH.gold : AUTH.muted;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ selected: liked, disabled: loading }}
      accessibilityLabel={
        liked ? `Quitar tu me gusta. Total: ${likesCount}.` : `Dar me gusta. Actualmente ${likesCount}.`
      }
      style={({ pressed }) => [styles.hit, pressed ? styles.pressed : null, loading ? styles.disabled : null]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator size="small" color={AUTH.gold} />
        ) : (
          <FeedHeartIcon filled={liked} color={color} />
        )}
        <Text style={[styles.count, { color }]}>{likesCount}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
  disabled: {
    opacity: 0.55,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  count: {
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
