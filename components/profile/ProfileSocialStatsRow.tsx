import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { formatProfileStatCount } from "../../utils/profileStatsFormat";

export type ProfileSocialStatsProps = {
  postsCount: number | null;
  followersCount: number | null;
  followingCount: number | null;
  loading?: boolean;
  onStatPress?: (kind: "posts" | "followers" | "following") => void;
};

function StatCell({
  value,
  label,
  onPress,
}: {
  value: string;
  label: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.value} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {value}
      </Text>
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.cell} accessibilityLabel={`${value} ${label}`}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label}`}
    >
      {content}
    </Pressable>
  );
}

/** Fila horizontal de métricas sociales. */
export function ProfileSocialStatsRow({
  postsCount,
  followersCount,
  followingCount,
  loading,
  onStatPress,
}: ProfileSocialStatsProps) {
  if (loading) {
    return <ActivityIndicator color={AUTH.gold} size="small" style={styles.loader} />;
  }

  return (
    <View style={styles.row} accessibilityRole="summary" accessibilityLabel="Estadísticas del perfil">
      <StatCell
        value={formatProfileStatCount(postsCount)}
        label="publicaciones"
        onPress={onStatPress ? () => onStatPress("posts") : undefined}
      />
      <View style={styles.sep} />
      <StatCell
        value={formatProfileStatCount(followersCount)}
        label="seguidores"
        onPress={onStatPress ? () => onStatPress("followers") : undefined}
      />
      <View style={styles.sep} />
      <StatCell
        value={formatProfileStatCount(followingCount)}
        label="siguiendo"
        onPress={onStatPress ? () => onStatPress("following") : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 2,
  },
  sep: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "rgba(82, 82, 82, 0.9)",
  },
  value: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  label: {
    color: AUTH.muted,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.85,
  },
});
