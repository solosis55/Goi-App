import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  GeoPermissionHint,
  ProfileGeoLocationButton,
} from "../profile/ProfileGeoLocationButton";

type SocialLocationCtaProps = {
  geoBusy?: boolean;
  geoError?: string | null;
  canOpenSettings?: boolean;
  onUseLocation: () => void;
  onOpenDeviceSettings: () => void;
  onEditProfile: () => void;
};

export function SocialLocationCta({
  geoBusy,
  geoError,
  canOpenSettings,
  onUseLocation,
  onOpenDeviceSettings,
  onEditProfile,
}: SocialLocationCtaProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Activa tu ubicación para descubrir atletas cerca con GPS (hasta 50 km).
      </Text>
      <ProfileGeoLocationButton busy={geoBusy} onPress={onUseLocation} compact />
      {geoError ? (
        <GeoPermissionHint
          message={geoError}
          onOpenSettings={canOpenSettings ? onOpenDeviceSettings : undefined}
        />
      ) : null}
      <Pressable
        onPress={onEditProfile}
        style={({ pressed }) => [pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Editar ubicación manualmente en el perfil"
      >
        <Text style={styles.link} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          O escribe tu ciudad en el perfil →
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    gap: 10,
  },
  text: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
