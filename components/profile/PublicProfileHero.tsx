import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { ProfileUser } from "../../types/auth";
import { UserAvatar } from "../ui/UserAvatar";

type PublicProfileHeroProps = {
  profile: ProfileUser | null;
  loading?: boolean;
  restricted?: boolean;
  following?: boolean;
  followBusy?: boolean;
  onBack: () => void;
  onToggleFollow: () => void;
};

function openUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return;
  void Linking.openURL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
}

export function PublicProfileHero({
  profile,
  loading,
  restricted,
  following,
  followBusy,
  onBack,
  onToggleFollow,
}: PublicProfileHeroProps) {
  const username = profile?.username?.trim() ?? "";
  const bannerUri = profile?.bannerUrl?.trim() ? resolveMediaUrl(profile.bannerUrl) : "";
  const showBanner =
    Boolean(bannerUri) && profile?.bannerShowInFeed !== false && !restricted;

  return (
    <View style={styles.wrap}>
      <View style={styles.bannerWrap} accessibilityLabel="Cabecera del perfil">
        {showBanner ? (
          <Image source={{ uri: bannerUri }} style={styles.banner} resizeMode="cover" accessibilityIgnoresInvertColors />
        ) : (
          <View style={styles.bannerEmpty} />
        )}
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
      </View>

      <View style={styles.identityRow}>
        <UserAvatar src={profile?.avatarUrl} username={username || "…"} size={92} />
        <View style={styles.meta}>
          <Text style={styles.handle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            @{loading && !username ? "…" : username || "usuario"}
          </Text>
          {!restricted && profile?.location?.trim() ? (
            <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {profile.location.trim()}
            </Text>
          ) : null}
          {!restricted && profile?.goal?.trim() ? (
            <Text style={styles.goal} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {profile.goal.trim()}
            </Text>
          ) : null}
          <Text style={styles.bio} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {restricted
              ? "Perfil limitado hasta que sigas a esta cuenta."
              : profile?.bio?.trim() || ""}
          </Text>
        </View>
      </View>

      {!restricted &&
      (profile?.websiteUrl?.trim() || profile?.instagramUrl?.trim() || profile?.stravaUrl?.trim()) ? (
        <View style={styles.links}>
          {profile?.websiteUrl?.trim() ? (
            <Pressable
              onPress={() => openUrl(profile.websiteUrl)}
              style={({ pressed }) => [styles.linkChip, pressed ? styles.pressed : null]}
            >
              <Text style={styles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Web
              </Text>
            </Pressable>
          ) : null}
          {profile?.instagramUrl?.trim() ? (
            <Pressable
              onPress={() => openUrl(profile.instagramUrl)}
              style={({ pressed }) => [styles.linkChip, pressed ? styles.pressed : null]}
            >
              <Text style={styles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Instagram
              </Text>
            </Pressable>
          ) : null}
          {profile?.stravaUrl?.trim() ? (
            <Pressable
              onPress={() => openUrl(profile.stravaUrl)}
              style={({ pressed }) => [styles.linkChip, pressed ? styles.pressed : null]}
            >
              <Text style={styles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Strava
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.followRow}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
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
  backBtn: {
    position: "absolute",
    left: 12,
    top: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  backText: {
    color: AUTH.neutral100,
    fontSize: 13,
    fontWeight: "600",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginTop: -40,
    gap: 14,
  },
  meta: {
    flex: 1,
    paddingTop: 46,
    gap: 4,
  },
  handle: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "700",
  },
  sub: {
    color: AUTH.muted,
    fontSize: 13,
  },
  goal: {
    color: AUTH.gold,
    fontSize: 13,
  },
  bio: {
    color: AUTH.steel,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  linkChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.9)",
    backgroundColor: "rgba(23, 23, 23, 0.8)",
  },
  linkText: {
    color: AUTH.neutral100,
    fontSize: 12,
    fontWeight: "600",
  },
  followRow: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    alignItems: "flex-end",
  },
  followBtn: {
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
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
    fontSize: 15,
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
