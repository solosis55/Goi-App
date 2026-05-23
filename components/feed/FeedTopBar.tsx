import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { SafeUser } from "../../types/auth";
import { UserAvatar } from "../ui/UserAvatar";
import { FeedNotificationsBell } from "./FeedNotificationsBell";

const LOGO_MARK = require("../../assets/branding/goi-logo-mark.png");

const COLLAPSE_DISTANCE = 72;

type FeedTopBarProps = {
  user: SafeUser | null;
  onBrandPress?: () => void;
  scrollY?: SharedValue<number>;
};

const LOGO_SIZE = 28;
const LOGO_SIZE_COLLAPSED = 24;
const HEADER_AVATAR_SIZE = 32;
const ACTION_SIZE = 36;

export function FeedTopBar({ user, onBrandPress, scrollY }: FeedTopBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const barAnim = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const y = scrollY.value;
    return {
      paddingBottom: interpolate(y, [0, COLLAPSE_DISTANCE], [8, 4], "clamp"),
      opacity: interpolate(y, [0, COLLAPSE_DISTANCE], [1, 0.92], "clamp"),
    };
  });

  const brandAnim = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const size = interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [LOGO_SIZE, LOGO_SIZE_COLLAPSED], "clamp");
    return { width: size, height: size, borderRadius: size / 2 };
  });

  const wordmarkAnim = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(scrollY.value, [0, COLLAPSE_DISTANCE * 0.6], [1, 0], "clamp"),
      maxWidth: interpolate(scrollY.value, [0, COLLAPSE_DISTANCE * 0.6], [80, 0], "clamp"),
    };
  });

  const goProfile = () => {
    router.push("/(tabs)/perfil");
  };

  return (
    <Animated.View style={[styles.bar, { paddingTop: Math.max(insets.top, 6) }, barAnim]}>
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
        <Animated.Image
          source={LOGO_MARK}
          style={[styles.logoBase, brandAnim]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <Animated.Text style={[styles.wordmark, wordmarkAnim]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          GoI
        </Animated.Text>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.75)",
    backgroundColor: "rgba(0, 0, 0, 0.94)",
    zIndex: 10,
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
    overflow: "hidden",
  },
  brandPressed: {
    opacity: 0.88,
  },
  logoBase: {
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  wordmark: {
    color: AUTH.gold,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 2,
    lineHeight: 20,
    overflow: "hidden",
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
