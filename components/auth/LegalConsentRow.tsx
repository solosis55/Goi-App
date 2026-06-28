import { Pressable, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, authScreenStyles } from "../../constants/authUi";
import { openLegalUrl } from "../../utils/openLegalUrl";

type Props = {
  checked: boolean;
  onToggle: (value: boolean) => void;
  error?: string;
};

export function LegalConsentRow({ checked, onToggle, error }: Props) {
  return (
    <View style={{ marginBottom: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel="Aceptar aviso legal y política de privacidad"
          onPress={() => onToggle(!checked)}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1, paddingTop: 2 }]}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: checked ? AUTH.gold : AUTH.fieldBorder,
              backgroundColor: checked ? "rgba(212, 175, 55, 0.2)" : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {checked ? (
              <Text
                style={{ color: AUTH.gold, fontSize: 13, fontWeight: "700" }}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                ✓
              </Text>
            ) : null}
          </View>
        </Pressable>
        <Text
          style={[authScreenStyles.cardSubtitle, { flex: 1, marginBottom: 0 }]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          Acepto el{" "}
          <Text
            style={authScreenStyles.linkText}
            onPress={() => void openLegalUrl("legalNotice")}
            suppressHighlighting
            accessibilityRole="link"
          >
            aviso legal
          </Text>{" "}
          y la{" "}
          <Text
            style={authScreenStyles.linkText}
            onPress={() => void openLegalUrl("privacy")}
            suppressHighlighting
            accessibilityRole="link"
          >
            política de privacidad
          </Text>
          .
        </Text>
      </View>
      {error ? (
        <Text style={[authScreenStyles.fieldError, { marginTop: 6, marginLeft: 32 }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
