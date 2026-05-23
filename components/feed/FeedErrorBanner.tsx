import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type FeedErrorBannerProps = {
  errorMessage?: string | null;
  errorDetail?: string;
  onRetry?: () => void;
};

export function FeedErrorBanner({ errorMessage, errorDetail, onRetry }: FeedErrorBannerProps) {
  if (!errorMessage) return null;

  return (
    <View style={styles.wrap}>
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
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
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
