import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type SocialSectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SocialSectionHeader({ title, subtitle }: SocialSectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
    gap: 3,
  },
  title: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  subtitle: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
