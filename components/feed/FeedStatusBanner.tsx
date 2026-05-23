import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type FeedStatusBannerProps = {
  actionMessage?: string | null;
  errorMessage?: string | null;
  errorDetail?: string;
  onRetry?: () => void;
};

/** Avisos de éxito o error del feed (separados del título superior). */
export function FeedStatusBanner({
  actionMessage,
  errorMessage,
  errorDetail,
  onRetry,
}: FeedStatusBannerProps) {
  if (!actionMessage && !errorMessage) return null;

  return (
    <View style={styles.wrap}>
      {actionMessage ? (
        <Text style={styles.success} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {actionMessage}
        </Text>
      ) : null}
      {errorMessage ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {errorMessage}
          </Text>
          {errorDetail ? (
            <Text style={styles.errorDetail} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {errorDetail}
            </Text>
          ) : null}
          {onRetry ? (
            <Pressable onPress={onRetry} hitSlop={8}>
              <Text style={styles.retry} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Reintentar
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    gap: 8,
  },
  success: {
    color: AUTH.success,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(134, 239, 172, 0.25)",
    backgroundColor: "rgba(22, 40, 28, 0.5)",
  },
  errorBlock: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    backgroundColor: "rgba(40, 20, 20, 0.45)",
    gap: 4,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 14,
  },
  errorDetail: {
    color: AUTH.muted,
    fontSize: 12,
  },
  retry: {
    marginTop: 4,
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
});
