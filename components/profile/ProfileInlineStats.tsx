import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { formatProfileStatCount } from "../../utils/profileStatsFormat";

export type ProfileInlineStatsProps = {
  postsCount: number | null;
  followersCount: number | null;
  followingCount: number | null;
  totalSessions: number | null;
  sessionsThisWeek: number | null;
  routinesCount: number | null;
  loading?: boolean;
};

function InlineStat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.item} accessibilityLabel={`${value} ${label}`}>
      <Text
        style={[styles.value, accent ? styles.valueAccent : null]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {value}
      </Text>
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

/** Stats compactos junto al @usuario (social + entreno). */
export function ProfileInlineStats({
  postsCount,
  followersCount,
  followingCount,
  totalSessions,
  sessionsThisWeek,
  routinesCount,
  loading,
}: ProfileInlineStatsProps) {
  if (loading) {
    return <ActivityIndicator color={AUTH.gold} size="small" style={styles.loader} />;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <InlineStat value={formatProfileStatCount(postsCount)} label="publicaciones" />
        <InlineStat value={formatProfileStatCount(followersCount)} label="seguidores" />
        <InlineStat value={formatProfileStatCount(followingCount)} label="siguiendo" />
      </View>
      <View style={styles.row}>
        <InlineStat value={formatProfileStatCount(totalSessions)} label="entrenos" />
        <InlineStat value={formatProfileStatCount(sessionsThisWeek)} label="esta semana" accent />
        <InlineStat value={formatProfileStatCount(routinesCount)} label="rutinas" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginTop: 6,
  },
  loader: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  item: {
    minWidth: 56,
    gap: 1,
  },
  value: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  valueAccent: {
    color: AUTH.gold,
  },
  label: {
    color: AUTH.muted,
    fontSize: 11,
  },
});
