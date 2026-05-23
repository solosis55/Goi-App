import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { UserAvatar } from "../ui/UserAvatar";

type ProfilePreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  username: string;
  bio: string;
  goal: string;
  location: string;
  avatarUrl?: string;
  bannerUrl?: string;
};

export function ProfilePreviewModal({
  visible,
  onClose,
  username,
  bio,
  goal,
  location,
  avatarUrl,
  bannerUrl,
}: ProfilePreviewModalProps) {
  const bannerUri = bannerUrl?.trim() ? resolveMediaUrl(bannerUrl) : "";
  const handle = username.trim() || "usuario";

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar vista previa" />
      <View style={styles.dialogWrap} pointerEvents="box-none">
        <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Vista previa pública
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Así ven otros tu cabecera y datos públicos (sin correo ni controles de edición).
          </Text>

          <ScrollView style={styles.cardScroll} bounces={false}>
            <View style={styles.card}>
              <View style={styles.bannerWrap}>
                {bannerUri ? (
                  <Image source={{ uri: bannerUri }} style={styles.banner} resizeMode="cover" accessibilityIgnoresInvertColors />
                ) : (
                  <View style={styles.bannerPlaceholder} />
                )}
                <View style={styles.bannerGradient} />
              </View>
              <View style={styles.identity}>
                <View style={styles.avatarOffset}>
                  <UserAvatar src={avatarUrl} username={handle} size={64} />
                </View>
                <View style={styles.meta}>
                  <Text style={styles.handle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    @{handle}
                  </Text>
                  {location.trim() ? (
                    <Text style={styles.location} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {location.trim()}
                    </Text>
                  ) : null}
                  {goal.trim() ? (
                    <Text style={styles.goal} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {goal.trim()}
                    </Text>
                  ) : null}
                  <Text style={styles.bio} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {bio.trim() || "Sin biografía."}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Text style={styles.closeBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cerrar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  dialogWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  dialog: {
    maxHeight: "88%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.8)",
    backgroundColor: "rgba(14, 14, 16, 0.98)",
    padding: 18,
    gap: 12,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  cardScroll: {
    maxHeight: 360,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
  },
  bannerWrap: {
    height: 112,
    backgroundColor: "rgba(35, 32, 22, 0.9)",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  bannerPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  identity: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  avatarOffset: {
    marginTop: -32,
    marginBottom: 8,
  },
  meta: {
    gap: 4,
  },
  handle: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
  },
  location: {
    color: AUTH.muted,
    fontSize: 12,
  },
  goal: {
    color: AUTH.gold,
    fontSize: 14,
  },
  bio: {
    color: AUTH.steel,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  closeBtn: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
  },
  closeBtnText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
