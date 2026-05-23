import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { UserAvatar } from "../ui/UserAvatar";

type ProfileHeroProps = {
  username: string;
  email?: string;
  goal?: string;
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
};

export function ProfileHero({
  username,
  email,
  goal,
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
}: ProfileHeroProps) {
  const bannerUri = bannerUrl ? resolveMediaUrl(bannerUrl) : "";

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
        {uploadingBanner ? (
          <View style={styles.bannerOverlay}>
            <ActivityIndicator color={AUTH.gold} />
          </View>
        ) : null}
        <View style={styles.bannerActions}>
          {onPreview ? (
            <Pressable
              onPress={onPreview}
              style={({ pressed }) => [styles.bannerBtn, pressed ? styles.pressed : null]}
              accessibilityRole="button"
              accessibilityLabel="Vista previa pública del perfil"
            >
              <Text style={styles.bannerBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Vista previa
              </Text>
            </Pressable>
          ) : null}
          {onShare ? (
            <Pressable
              onPress={onShare}
              style={({ pressed }) => [styles.bannerBtn, pressed ? styles.pressed : null]}
              accessibilityRole="button"
              accessibilityLabel="Compartir perfil"
            >
              <Text style={styles.bannerBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Compartir
              </Text>
            </Pressable>
          ) : null}
          {!restricted ? (
            <Pressable
              onPress={onChangeBanner}
              disabled={disabled || uploadingBanner}
              style={({ pressed }) => [styles.bannerBtn, pressed ? styles.pressed : null]}
              accessibilityRole="button"
              accessibilityLabel={uploadingBanner ? "Subiendo cabecera" : "Cambiar imagen de cabecera"}
              accessibilityState={{ busy: uploadingBanner }}
            >
              <Text style={styles.bannerBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Cabecera
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

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
          {email ? (
            <Text style={styles.email} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {email}
            </Text>
          ) : null}
          {goal?.trim() ? (
            <Text style={styles.goal} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {goal.trim()}
            </Text>
          ) : null}
          {restricted ? (
            <Text style={styles.restricted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Perfil limitado: solo seguidores ven el detalle completo.
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
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
  bannerActions: {
    position: "absolute",
    right: 8,
    bottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 6,
    maxWidth: "92%",
  },
  bannerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  bannerBtnText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginTop: -40,
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
    paddingTop: 46,
    gap: 4,
  },
  handle: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "700",
  },
  email: {
    color: AUTH.muted,
    fontSize: 13,
  },
  goal: {
    color: AUTH.steel,
    fontSize: 13,
    marginTop: 4,
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
