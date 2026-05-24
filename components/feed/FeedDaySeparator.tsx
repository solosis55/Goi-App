import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type FeedDaySeparatorProps = {
  label: string;
};

export function FeedDaySeparator({ label }: FeedDaySeparatorProps) {
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <View style={styles.line} />
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
    marginBottom: 4,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(212, 175, 55, 0.22)",
  },
  label: {
    color: "rgba(163, 163, 163, 0.95)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
