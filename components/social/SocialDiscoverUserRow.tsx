import { useRouter } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { DiscoverUser } from "../../types/auth";
import { discoverDisplayReason } from "../../utils/discoverDisplayReason";
import { profileFollowButtonStyles as followStyles } from "../profile/profileFollowButtonStyles";
import { UserAvatar } from "../ui/UserAvatar";

type SocialDiscoverUserRowProps = {
  user: DiscoverUser;
  following: boolean;
  followPending?: boolean;
  followBusy?: boolean;
  onPressFollow: (userId: string) => void;
};

function SocialDiscoverUserRowInner({
  user,
  following,
  followPending,
  followBusy,
  onPressFollow,
}: SocialDiscoverUserRowProps) {
  const router = useRouter();
  const reason = discoverDisplayReason(user);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: user.id } })}
        style={({ pressed }) => [styles.main, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={`Ver perfil de ${user.username}`}
      >
        <UserAvatar src={user.avatarUrl} username={user.username} size={48} />
        <View style={styles.body}>
          <Text style={styles.username} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            @{user.username}
          </Text>
          {reason ? (
            <Text style={styles.reason} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {reason}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            {(user.mutualPreview ?? []).slice(0, 2).map((m, i) => (
              <View key={`${m.id || "m"}-${i}`} style={styles.mutualChip}>
                <UserAvatar src={m.avatarUrl} username={m.username} size={16} />
                <Text style={styles.mutualText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  @{m.username}
                </Text>
              </View>
            ))}
            {user.trainedThisWeek ? (
              <Text style={styles.badge} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Entrenó esta semana
              </Text>
            ) : user.activeThisWeek ? (
              <Text style={styles.badgeMuted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Activo
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
      <Pressable
        disabled={following || followPending || followBusy}
        onPress={() => onPressFollow(user.id)}
        style={({ pressed }) => [
          followStyles.base,
          following || followPending ? followStyles.following : followStyles.primary,
          followBusy ? followStyles.busy : null,
          pressed ? followStyles.pressed : null,
        ]}
      >
        <Text
          style={following || followPending ? followStyles.textFollowing : followStyles.textPrimary}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          {followBusy ? "…" : following ? "Siguiendo" : followPending ? "Solicitado" : "Seguir"}
        </Text>
      </Pressable>
    </View>
  );
}

function discoverUserRowEqual(
  prev: SocialDiscoverUserRowProps,
  next: SocialDiscoverUserRowProps
): boolean {
  return (
    prev.user === next.user &&
    prev.following === next.following &&
    prev.followPending === next.followPending &&
    prev.followBusy === next.followBusy &&
    prev.onPressFollow === next.onPressFollow
  );
}

export const SocialDiscoverUserRow = memo(SocialDiscoverUserRowInner, discoverUserRowEqual);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  body: { flex: 1, gap: 4 },
  username: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "700",
  },
  reason: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  mutualChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(35, 32, 22, 0.6)",
  },
  mutualText: {
    color: AUTH.muted,
    fontSize: 11,
  },
  badge: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "600",
  },
  badgeMuted: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
