import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { UserAvatar } from "../ui/UserAvatar";
import { ProfileBannerOverlay } from "./ProfileBannerOverlay";
import { ProfileHeroActionsMenu } from "./ProfileHeroActionsMenu";
import { ProfileSocialStatsRow, type ProfileSocialStatsProps } from "./ProfileSocialStatsRow";

type ProfileHeroProps = {
  username: string;
  avatarUrl?: string;
  bannerUrl?: string;
  restricted?: boolean;
  uploadingAvatar?: boolean;
  uploadingBanner?: boolean;
  disabled?: boolean;
  onChangeAvatar: () => void;
  onChangeBanner: () => void;
  onPreview?: () => void;
  onShare?: () => void;
  socialStats: ProfileSocialStatsProps;
  onSocialStatPress?: (kind: "posts" | "followers" | "following") => void;
};

export function ProfileHero({
  username,
  avatarUrl,
  bannerUrl,
  restricted,
  uploadingAvatar,
  uploadingBanner,
  disabled,
  onChangeAvatar,
  onChangeBanner,
  onPreview,
  onShare,
  socialStats,
  onSocialStatPress,
}: ProfileHeroProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const bannerUri = bannerUrl ? resolveMediaUrl(bannerUrl) : "";
  const showMenu = Boolean(onPreview || onShare || (!restricted && onChangeBanner));

  return (
    <View style={styles.wrap}>
      <View
        style={styles.bannerWrap}
        accessibilityLabel={bannerUri ? "Imagen de cabecera del perfil" : "Sin cabecera de perfil"}
      >
        {bannerUri ? (
          <Image
            source={{ uri: bannerUri }}
            style={styles.banner}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.bannerEmpty}>
            <Text style={styles.bannerEmptyText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Añade una cabecera
            </Text>
          </View>
        )}
        <ProfileBannerOverlay />
        {uploadingBanner ? (
          <View style={styles.bannerOverlay}>
            <ActivityIndicator color={AUTH.gold} />
          </View>
        ) : null}
        {showMenu ? (
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [styles.menuBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Más acciones del perfil"
          >
            <Text style={styles.menuBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              ⋯
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.identityBlock}>
        <View style={styles.identityRow}>
          <View style={styles.avatarSlot}>
            <UserAvatar src={avatarUrl} username={username} size={92} />
            {uploadingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={AUTH.gold} size="small" />
              </View>
            ) : null}
            {!restricted ? (
              <Pressable
                onPress={onChangeAvatar}
                disabled={disabled || uploadingAvatar}
                style={({ pressed }) => [styles.avatarBtn, pressed ? styles.pressed : null]}
                accessibilityRole="button"
                accessibilityLabel={uploadingAvatar ? "Subiendo foto de perfil" : "Cambiar foto de perfil"}
                accessibilityState={{ busy: uploadingAvatar }}
              >
                <Text style={styles.avatarBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Foto
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.meta}>
            <Text style={styles.handle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{username || "…"}
            </Text>
            {restricted ? (
              <Text style={styles.restricted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Perfil limitado: solo seguidores ven el detalle completo.
              </Text>
            ) : null}
          </View>
        </View>

        {!restricted ? (
          <ProfileSocialStatsRow {...socialStats} onStatPress={onSocialStatPress} />
        ) : null}
      </View>

      <ProfileHeroActionsMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPreview={onPreview}
        onShare={onShare}
        onChangeBanner={!restricted ? onChangeBanner : undefined}
        bannerDisabled={disabled || uploadingBanner}
      />
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
    alignItems: "center",
    justifyContent: "center",
  },
  bannerEmptyText: {
    color: AUTH.muted,
    fontSize: 14,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  menuBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  menuBtnText: {
    color: AUTH.gold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
  identityBlock: {
    paddingHorizontal: 16,
    marginTop: -36,
    gap: 10,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },
  avatarSlot: {
    position: "relative",
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 46,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  avatarBtn: {
    position: "absolute",
    right: -4,
    bottom: -2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "rgba(10, 10, 12, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
  },
  avatarBtnText: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  meta: {
    flex: 1,
    paddingBottom: 8,
    minWidth: 0,
  },
  handle: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "700",
  },
  restricted: {
    color: "#fbbf24",
    fontSize: 12,
    marginTop: 6,
  },
  pressed: {
    opacity: 0.85,
  },
});
