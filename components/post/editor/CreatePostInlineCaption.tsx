import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { POST_BODY_MAX } from "../../../constants/createPost";
import { CAPTION_PROMPTS_STANDARD } from "../../../constants/createPostPrompts";

type CreatePostInlineCaptionProps = {
  value: string;
  onChange: (text: string) => void;
  charCount: number;
  onFocus?: () => void;
};

export function CreatePostInlineCaption({ value, onChange, charCount, onFocus }: CreatePostInlineCaptionProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        placeholder="Escribe el pie de foto…"
        placeholderTextColor={AUTH.faint}
        multiline
        style={styles.input}
        maxLength={POST_BODY_MAX + 80}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      />
      <View style={styles.footer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prompts}>
          {CAPTION_PROMPTS_STANDARD.map((prompt) => (
            <Pressable
              key={prompt}
              onPress={() => onChange(prompt)}
              style={({ pressed }) => [styles.promptChip, pressed ? styles.promptPressed : null]}
            >
              <Text style={styles.promptText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER} numberOfLines={1}>
                {prompt}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text
          style={[styles.count, charCount > POST_BODY_MAX ? styles.countOver : null]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          {charCount}/{POST_BODY_MAX}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AUTH.cardBorder,
    backgroundColor: "rgba(12, 12, 14, 0.95)",
  },
  input: {
    minHeight: 44,
    maxHeight: 96,
    color: AUTH.neutral100,
    fontSize: 15,
    lineHeight: 21,
    padding: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  prompts: {
    gap: 6,
    paddingRight: 8,
    flex: 1,
  },
  promptChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(115, 115, 115, 0.45)",
    backgroundColor: "rgba(24, 24, 26, 0.9)",
    maxWidth: 180,
  },
  promptPressed: { opacity: 0.85 },
  promptText: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  count: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "600",
  },
  countOver: {
    color: AUTH.danger,
  },
});
