import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { ProfileUser } from "../../types/auth";
import { ProfileAvatarStoryRing } from "./ProfileAvatarStoryRing";
import { ProfileBannerEmptyFill } from "./ProfileBannerEmptyFill";
import { ProfileBannerOverlay } from "./ProfileBannerOverlay";
import { ProfileSocialStatsRow, type ProfileSocialStatsProps } from "./ProfileSocialStatsRow";
import { profileFollowButtonStyles as followStyles } from "./profileFollowButtonStyles";

type PublicProfileHeroProps = {
  profile: ProfileUser | null;
  loading?: boolean;
  restricted?: boolean;
  following?: boolean;
  followBusy?: boolean;
  followsYou?: boolean;
  mutualCount?: number;
  memberSinceLabel?: string;
  activityLine?: string | null;
  unseenDaily?: boolean;
  onBack: () => void;
  onToggleFollow: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onAvatarPress?: () => void;
  socialStats: ProfileSocialStatsProps;
  onSocialStatPress?: (kind: "posts" | "followers" | "following") => void;
};

function buildContextLine(
  followsYou: boolean,
  following: boolean,
  memberSinceLabel?: string
): string | null {
  const parts: string[] = [];
  if (following && followsYou) parts.push("Seguimiento mutuo");
  else if (followsYou) parts.push("Te sigue");
  else if (following) parts.push("Lo sigues");
  if (memberSinceLabel?.trim()) parts.push(`En GoI desde ${memberSinceLabel.trim()}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function PublicProfileHero({
  profile,
  loading,
  restricted,
  following,
  followBusy,
  followsYou = false,
  memberSinceLabel,
  activityLine,
  unseenDaily,
  onBack,
  onToggleFollow,
  onShare,
  onMore,
  onAvatarPress,
  socialStats,
  onSocialStatPress,
}: PublicProfileHeroProps) {
  const insets = useSafeAreaInsets();
  const username = profile?.username?.trim() ?? "";
  const bannerUri = profile?.bannerUrl?.trim() ? resolveMediaUrl(profile.bannerUrl) : "";
  const showBanner = Boolean(bannerUri) && profile?.bannerShowInFeed !== false && !restricted;
  const bannerHeight = 148;
  const actionsTop = insets.top + 8;
  const contextLine = buildContextLine(!!followsYou, !!following, memberSinceLabel);

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.bannerWrap, { height: bannerHeight + insets.top }]}
        accessibilityLabel="Cabecera del perfil"
      >
        {showBanner ? (
          <Image
            source={{ uri: bannerUri }}
            style={[styles.bannerMedia, { height: bannerHeight }]}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <ProfileBannerEmptyFill height={bannerHeight} style={styles.bannerEmptyPos} />
        )}
        <ProfileBannerOverlay />
        <View style={[styles.bannerActions, { top: actionsTop }]}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Text style={styles.backText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              ← Volver
            </Text>
          </Pressable>
          <View style={styles.bannerRight}>
            {!restricted && onShare ? (
              <Pressable
                onPress={onShare}
                style={({ pressed }) => [styles.shareBtn, pressed ? styles.pressed : null]}
                accessibilityRole="button"
                accessibilityLabel="Compartir perfil"
              >
                <Text style={styles.shareText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Compartir
                </Text>
              </Pressable>
            ) : null}
            {!restricted && onMore ? (
              <Pressable
                onPress={onMore}
                style={({ pressed }) => [styles.moreBtn, pressed ? styles.pressed : null]}
                accessibilityRole="button"
                accessibilityLabel="Más opciones"
              >
                <Text style={styles.moreText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  ···
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.identityBlock}>
        <View style={styles.identityRow}>
          <View style={styles.avatarShadow}>
            <ProfileAvatarStoryRing
              src={profile?.avatarUrl}
              username={username || "…"}
              size={92}
              unseenDaily={unseenDaily}
              onPress={onAvatarPress}
            />
          </View>
          <View style={styles.meta}>
            <Text style={styles.handle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{loading && !username ? "…" : username || "usuario"}
            </Text>
            {activityLine?.trim() ? (
              <View style={styles.activityPill}>
                <Text style={styles.activityText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {activityLine.trim()}
                </Text>
              </View>
            ) : null}
            {contextLine ? (
              <Text style={styles.contextLine} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {contextLine}
              </Text>
            ) : null}
            {!restricted ? (
              <Pressable
                onPress={onToggleFollow}
                disabled={followBusy || loading}
                style={({ pressed }) => [
                  followStyles.base,
                  following ? followStyles.following : followStyles.primary,
                  pressed ? followStyles.pressed : null,
                  followBusy ? followStyles.busy : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={following ? "Dejar de seguir" : "Seguir usuario"}
                accessibilityState={{ busy: followBusy, disabled: followBusy || loading }}
              >
                {followBusy ? (
                  <ActivityIndicator color={following ? AUTH.gold : "#0a0a0c"} size="small" />
                ) : (
                  <Text
                    style={following ? followStyles.textFollowing : followStyles.textPrimary}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    {following ? "Siguiendo" : "Seguir"}
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>

        <ProfileSocialStatsRow {...socialStats} onStatPress={onSocialStatPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  bannerWrap: {
    backgroundColor: AUTH.bg,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bannerMedia: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
  },
  bannerEmptyPos: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerActions: {
    position: "absolute",
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    zIndex: 2,
  },
  backBtn: {
    flexShrink: 1,
    maxWidth: "42%",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  bannerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    justifyContent: "flex-end",
    maxWidth: "56%",
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.9)",
  },
  moreBtn: {
    width: 36,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.9)",
  },
  moreText: {
    color: AUTH.steel,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  backText: {
    color: AUTH.neutral100,
    fontSize: 13,
    fontWeight: "600",
  },
  shareText: {
    color: AUTH.steel,
    fontSize: 13,
    fontWeight: "600",
  },
  identityBlock: {
    paddingHorizontal: 16,
    marginTop: -36,
    gap: 12,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatarShadow: {
    borderRadius: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  meta: {
    flex: 1,
    paddingTop: 40,
    gap: 8,
    minWidth: 0,
  },
  handle: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  activityPill: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
  },
  activityText: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  contextLine: {
    color: AUTH.faint,
    fontSize: 12,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.88,
  },
});
