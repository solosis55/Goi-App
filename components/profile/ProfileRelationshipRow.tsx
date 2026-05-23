import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type ProfileRelationshipRowProps = {
  following: boolean;
  followsYou: boolean;
  mutualCount: number;
};

export function ProfileRelationshipRow({ following, followsYou, mutualCount }: ProfileRelationshipRowProps) {
  const chips: string[] = [];
  if (following && followsYou) chips.push("Seguimiento mutuo");
  else if (followsYou) chips.push("Te sigue");
  else if (following) chips.push("Lo sigues");
  if (mutualCount > 0) {
    chips.push(
      mutualCount === 1 ? "1 seguidor en común" : `${mutualCount} seguidores en común`
    );
  }
  if (chips.length === 0) return null;

  return (
    <View style={styles.wrap} accessibilityRole="text">
      {chips.map((label) => (
        <View key={label} style={styles.chip}>
          <Text style={styles.chipText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.9)",
    backgroundColor: "rgba(23, 23, 23, 0.75)",
  },
  chipText: {
    color: AUTH.steel,
    fontSize: 12,
    fontWeight: "600",
  },
});
