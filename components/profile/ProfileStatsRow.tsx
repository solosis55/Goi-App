import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type ProfileStatsRowProps = {
  postsCount: number | null;
  followersCount: number | null;
  followingCount: number | null;
  routinesCount?: number | null;
  loading?: boolean;
};

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.cell} accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.value} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {value}
      </Text>
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

function formatCount(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export function ProfileStatsRow({
  postsCount,
  followersCount,
  followingCount,
  routinesCount = null,
  loading,
}: ProfileStatsRowProps) {
  return (
    <View style={styles.wrap}>
      {loading ? (
        <ActivityIndicator color={AUTH.gold} size="small" style={styles.loader} />
      ) : (
        <>
          <StatCell value={formatCount(postsCount)} label="publicaciones" />
          <View style={styles.divider} />
          <StatCell value={formatCount(followersCount)} label="seguidores" />
          <View style={styles.divider} />
          <StatCell value={formatCount(followingCount)} label="siguiendo" />
          <View style={styles.divider} />
          <StatCell value={formatCount(routinesCount)} label="rutinas" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  loader: {
    flex: 1,
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  value: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    color: AUTH.faint,
    fontSize: 10,
    textTransform: "lowercase",
    textAlign: "center",
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "rgba(64, 64, 64, 0.8)",
  },
});
