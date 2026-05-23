import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { ProfileUser } from "../../types/auth";
import { ProfileAvatarStoryRing } from "./ProfileAvatarStoryRing";
import { ProfileBannerOverlay } from "./ProfileBannerOverlay";
import { ProfileRelationshipRow } from "./ProfileRelationshipRow";
import { ProfileSocialStatsRow, type ProfileSocialStatsProps } from "./ProfileSocialStatsRow";

type PublicProfileHeroProps = {
  profile: ProfileUser | null;
  loading?: boolean;
  restricted?: boolean;
  following?: boolean;
  followBusy?: boolean;
  followsYou?: boolean;
  mutualCount?: number;
  memberSinceLabel?: string;
  unseenDaily?: boolean;
  onBack: () => void;
  onToggleFollow: () => void;
  onShare?: () => void;
  onAvatarPress?: () => void;
  socialStats: ProfileSocialStatsProps;
  onSocialStatPress?: (kind: "posts" | "followers" | "following") => void;
};

export function PublicProfileHero({
  profile,
  loading,
  restricted,
  following,
  followBusy,
  followsYou = false,
  mutualCount = 0,
  memberSinceLabel,
  unseenDaily,
  onBack,
  onToggleFollow,
  onShare,
  onAvatarPress,
  socialStats,
  onSocialStatPress,
}: PublicProfileHeroProps) {
  const username = profile?.username?.trim() ?? "";
  const bannerUri = profile?.bannerUrl?.trim() ? resolveMediaUrl(profile.bannerUrl) : "";
  const showBanner = Boolean(bannerUri) && profile?.bannerShowInFeed !== false && !restricted;

  return (
    <View style={styles.wrap}>
      <View style={styles.bannerWrap} accessibilityLabel="Cabecera del perfil">
        {showBanner ? (
          <Image
            source={{ uri: bannerUri }}
            style={styles.banner}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.bannerEmpty} />
        )}
        <ProfileBannerOverlay />
        <View style={styles.bannerActions}>
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
        </View>
      </View>

      <View style={styles.identityBlock}>
        <View style={styles.identityRow}>
          <ProfileAvatarStoryRing
            src={profile?.avatarUrl}
            username={username || "…"}
            size={92}
            unseenDaily={unseenDaily}
            onPress={onAvatarPress}
          />
          <View style={styles.meta}>
            <Text style={styles.handle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{loading && !username ? "…" : username || "usuario"}
            </Text>
            {memberSinceLabel ? (
              <Text style={styles.memberSince} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                En GoI desde {memberSinceLabel}
              </Text>
            ) : null}
            {!restricted ? (
              <ProfileRelationshipRow
                following={!!following}
                followsYou={followsYou}
                mutualCount={mutualCount}
              />
            ) : null}
            {!restricted ? (
              <Pressable
                onPress={onToggleFollow}
                disabled={followBusy || loading}
                style={({ pressed }) => [
                  styles.followBtn,
                  following ? styles.followBtnActive : null,
                  pressed ? styles.pressed : null,
                  followBusy ? styles.followBusy : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={following ? "Dejar de seguir" : "Seguir usuario"}
                accessibilityState={{ busy: followBusy, disabled: followBusy || loading }}
              >
                {followBusy ? (
                  <ActivityIndicator color={following ? AUTH.gold : "#0a0a0a"} size="small" />
                ) : (
                  <Text
                    style={[styles.followText, following ? styles.followTextActive : null]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    {following ? "Siguiendo" : "Seguir"}
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>

        {!restricted ? <ProfileSocialStatsRow {...socialStats} onStatPress={onSocialStatPress} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
  bannerWrap: {
    height: 148,
    backgroundColor: "rgba(23, 23, 23, 0.9)",
    overflow: "hidden",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  bannerEmpty: {
    flex: 1,
    backgroundColor: "rgba(38, 38, 38, 0.95)",
  },
  bannerActions: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.9)",
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
    gap: 10,
    marginBottom: 4,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
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
  },
  memberSince: {
    color: AUTH.faint,
    fontSize: 12,
  },
  followBtn: {
    alignSelf: "flex-start",
    minWidth: 108,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignItems: "center",
    backgroundColor: AUTH.gold,
  },
  followBtnActive: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.5)",
  },
  followText: {
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: "700",
  },
  followTextActive: {
    color: AUTH.gold,
  },
  followBusy: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.88,
  },
});
