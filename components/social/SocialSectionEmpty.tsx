import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type SocialSectionEmptyProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SocialSectionEmpty({ title, body, actionLabel, onAction }: SocialSectionEmptyProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>
      <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.btn, pressed ? styles.pressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.btnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 12,
    gap: 6,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  body: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  btn: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 6,
  },
  btnText: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
