import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";
import type { ProfileBadge } from "../../utils/profileBadges";
import { badgesWithCopy } from "../../utils/profileBadgeCopy";

type ProfileBadgesRowProps = {
  badges: ProfileBadge[];
};

export function ProfileBadgesRow({ badges }: ProfileBadgesRowProps) {
  const { showAlert } = useGoiAlert();
  const enriched = badgesWithCopy(badges);

  if (enriched.length === 0) return null;

  return (
    <View style={styles.wrap} accessibilityRole="list" accessibilityLabel="Logros del perfil">
      {enriched.map((b) => (
        <Pressable
          key={b.id}
          onPress={() =>
            showAlert({
              title: b.label,
              message: b.description,
              buttons: [{ text: "Entendido", style: "default" }],
            })
          }
          style={({ pressed }) => [styles.chip, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`${b.label}. Pulsa para más información.`}
        >
          <Text style={styles.chipText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {b.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(35, 32, 22, 0.75)",
  },
  chipText: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
