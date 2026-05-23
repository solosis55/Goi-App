import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { SafeUser } from "../../types/auth";
import { UserAvatar } from "../ui/UserAvatar";
import { FeedNotificationsBell } from "./FeedNotificationsBell";

const LOGO_MARK = require("../../assets/branding/goi-logo-mark.png");

type FeedTopBarProps = {
  user: SafeUser | null;
  onBrandPress?: () => void;
};

const LOGO_SIZE = 28;
const HEADER_AVATAR_SIZE = 32;
/** Altura común de campana y avatar para alinear el logo en la misma línea. */
const ACTION_SIZE = 36;

export function FeedTopBar({ user, onBrandPress }: FeedTopBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goProfile = () => {
    router.push("/(tabs)/perfil");
  };

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 6) }]}>
      <View style={styles.sideSpacer} />

      <Pressable
        onPress={onBrandPress}
        disabled={!onBrandPress}
        accessibilityRole="button"
        accessibilityLabel="GoI, ir al inicio del feed"
        style={({ pressed }) => [
          styles.brandHit,
          { height: ACTION_SIZE },
          pressed && onBrandPress ? styles.brandPressed : null,
        ]}
      >
        <Image source={LOGO_MARK} style={styles.logo} resizeMode="cover" accessibilityIgnoresInvertColors />
        <Text style={styles.wordmark} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          GoI
        </Text>
      </Pressable>

      <View style={styles.actionsWrap}>
        <FeedNotificationsBell unreadCount={0} compact />
        {user?.username ? (
          <Pressable
            onPress={goProfile}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Ir a mi perfil"
            style={({ pressed }) => [
              styles.avatarHit,
              { width: ACTION_SIZE, height: ACTION_SIZE },
              pressed ? styles.avatarPressed : null,
            ]}
          >
            <UserAvatar src={user.avatarUrl} username={user.username} size={HEADER_AVATAR_SIZE} />
          </Pressable>
        ) : (
          <View style={{ width: ACTION_SIZE, height: ACTION_SIZE }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingBottom: 8,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.75)",
    backgroundColor: "rgba(0, 0, 0, 0.94)",
  },
  sideSpacer: {
    flex: 1,
  },
  brandHit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  brandPressed: {
    opacity: 0.88,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  wordmark: {
    color: AUTH.gold,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 2,
    lineHeight: 20,
  },
  actionsWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  avatarHit: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPressed: {
    opacity: 0.88,
  },
});
