import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";

type CreatePostPendingPublishBannerProps = {
  message: string;
  retrying: boolean;
  onRetry: () => void;
  onDismiss: () => void;
};

export function CreatePostPendingPublishBanner({
  message,
  retrying,
  onRetry,
  onDismiss,
}: CreatePostPendingPublishBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Publicación pendiente
        </Text>
        <Text style={styles.message} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {message}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onRetry}
          disabled={retrying}
          style={({ pressed }) => [styles.retryBtn, pressed ? styles.pressed : null, retrying ? styles.disabled : null]}
          accessibilityRole="button"
          accessibilityLabel="Reintentar publicación"
        >
          <Text style={styles.retryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {retrying ? "Enviando…" : "Reintentar"}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDismiss}
          disabled={retrying}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Descartar publicación pendiente"
        >
          <Text style={styles.dismissText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Descartar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 12,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.9)",
    gap: 10,
  },
  copy: { gap: 4 },
  title: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: AUTH.gold,
  },
  retryText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "800",
  },
  dismissText: {
    color: AUTH.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.55 },
});
