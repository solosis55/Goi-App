import { StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
type PerformSetMiniRestRowProps = {
  value: string;
  disabled?: boolean;
  done?: boolean;
  onChange: (sec: string) => void;
};

export function PerformSetMiniRestRow({ value, disabled, done, onChange }: PerformSetMiniRestRowProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Mini-descanso
      </Text>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, 4))}
        placeholder="15"
        placeholderTextColor={AUTH.faint}
        keyboardType="number-pad"
        style={[styles.input, done ? styles.inputDone : null]}
        editable={!disabled && !done}
        accessibilityLabel="Segundos entre pausas"
      />
      <Text style={styles.suffix} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 6,
    maxWidth: "72%",
    paddingRight: 2,
    paddingBottom: 2,
    marginTop: -2,
  },
  label: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "600",
  },
  input: {
    width: 48,
    minHeight: 32,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    color: AUTH.neutral100,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(10, 10, 12, 0.65)",
    borderLeftWidth: 2,
    borderLeftColor: "rgba(192, 132, 252, 0.45)",
  },
  inputDone: {
    opacity: 0.6,
  },
  suffix: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "600",
  },
});
