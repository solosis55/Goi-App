import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";

type FeedNotificationsBellProps = {
  unreadCount?: number;
  compact?: boolean;
  onPress?: () => void;
};

function hapticLight() {
  if (Platform.OS === "web") return;
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* sin módulo nativo */
  }
}

function BellIcon({ size = 22, color = AUTH.neutral100 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      <Path d="M10 20a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </Svg>
  );
}

export function FeedNotificationsBell({
  unreadCount = 0,
  compact = false,
  onPress: onPressProp,
}: FeedNotificationsBellProps) {
  const { showAlert } = useGoiAlert();
  const showBadge = unreadCount > 0;

  const onPress = useCallback(() => {
    hapticLight();
    if (onPressProp) {
      onPressProp();
      return;
    }
    showAlert({
      title: "Notificaciones",
      message: "No se pudo abrir el panel de notificaciones.",
      buttons: [{ text: "Entendido", style: "cancel" }],
    });
  }, [onPressProp, showAlert]);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={
        showBadge ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"
      }
      style={({ pressed }) => [
        compact ? styles.btnCompact : styles.btn,
        pressed ? styles.btnPressed : null,
      ]}
    >
      <BellIcon size={compact ? 24 : 22} />
      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {unreadCount > 99 ? "99+" : String(unreadCount)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23, 23, 23, 0.5)",
  },
  btnCompact: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    opacity: 0.85,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: AUTH.danger,
    borderWidth: 1,
    borderColor: AUTH.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: AUTH.neutral100,
    fontSize: 9,
    fontWeight: "700",
  },
});
