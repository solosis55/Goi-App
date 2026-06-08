import { Pressable, StyleSheet, Text } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useFeedPrefsStore } from "../../stores/useFeedPrefsStore";

export function SocialFeedSuggestionsRestore() {
  const { user } = useAuth();
  const suggestionsDismiss = useFeedPrefsStore((s) => s.suggestionsDismiss);
  const setSuggestionsDismissState = useFeedPrefsStore((s) => s.setSuggestionsDismissState);

  const show = suggestionsDismiss.mode === "permanent";

  if (!show || !user?.id) return null;

  return (
    <Pressable
      onPress={() => {
        void setSuggestionsDismissState(user.id, { mode: "none" });
      }}
      style={({ pressed }) => [styles.btn, pressed ? styles.pressed : null]}
    >
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Volver a mostrar sugerencias en el feed
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 8,
  },
  text: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
