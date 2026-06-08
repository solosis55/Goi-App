import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { openDeviceSettings } from "../../utils/deviceLocation";

type ProfileGeoLocationButtonProps = {
  busy?: boolean;
  disabled?: boolean;
  hasGeo?: boolean;
  onPress: () => void;
  compact?: boolean;
};

export function ProfileGeoLocationButton({
  busy,
  disabled,
  hasGeo,
  onPress,
  compact,
}: ProfileGeoLocationButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.btn,
        compact ? styles.btnCompact : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={hasGeo ? "Actualizar ubicación GPS" : "Usar mi ubicación"}
      accessibilityState={{ busy: !!busy }}
    >
      {busy ? (
        <ActivityIndicator size="small" color={AUTH.gold} />
      ) : (
        <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {hasGeo ? "Actualizar GPS" : "Usar mi ubicación"}
        </Text>
      )}
    </Pressable>
  );
}

export function GeoPermissionHint({
  message,
  onOpenSettings,
}: {
  message: string;
  onOpenSettings?: () => void;
}) {
  return (
    <View style={styles.hintWrap}>
      <Text style={styles.hintText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {message}
      </Text>
      {onOpenSettings ? (
        <Pressable onPress={onOpenSettings} hitSlop={8} accessibilityRole="button">
          <Text style={styles.hintLink} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Abrir ajustes →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export { openDeviceSettings };

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.85)",
    minWidth: 148,
    alignItems: "center",
  },
  btnCompact: {
    paddingVertical: 8,
    minWidth: 0,
  },
  text: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.5 },
  hintWrap: {
    gap: 6,
    marginTop: 6,
  },
  hintText: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  hintLink: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
});
