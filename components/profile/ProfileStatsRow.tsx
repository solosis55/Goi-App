import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { formatProfileStatCount } from "../../utils/profileStatsFormat";

type ProfileStatsRowProps = {
  postsCount: number | null;
  followersCount: number | null;
  followingCount: number | null;
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

export function ProfileStatsRow({
  postsCount,
  followersCount,
  followingCount,
  loading,
}: ProfileStatsRowProps) {
  return (
    <View style={styles.wrap}>
      {loading ? (
        <ActivityIndicator color={AUTH.gold} size="small" style={styles.loader} />
      ) : (
        <>
          <StatCell value={formatProfileStatCount(postsCount)} label="publicaciones" />
          <View style={styles.divider} />
          <StatCell value={formatProfileStatCount(followersCount)} label="seguidores" />
          <View style={styles.divider} />
          <StatCell value={formatProfileStatCount(followingCount)} label="siguiendo" />
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
