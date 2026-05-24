import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type ProfileSectionRestrictedHintProps = {
  title: string;
  body: string;
};

export function ProfileSectionRestrictedHint({ title, body }: ProfileSectionRestrictedHintProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>
      <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.45)",
    backgroundColor: "rgba(18, 18, 20, 0.6)",
    gap: 4,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  body: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
