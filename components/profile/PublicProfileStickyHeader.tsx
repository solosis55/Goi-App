import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { GoiGoldFadeLine } from "../ui/GoiGoldFadeLine";
import { UserAvatar } from "../ui/UserAvatar";
import { profileFollowButtonStyles as followStyles } from "./profileFollowButtonStyles";

type PublicProfileStickyHeaderProps = {
  visible: boolean;
  username: string;
  avatarUrl?: string;
  following: boolean;
  followBusy: boolean;
  onBack: () => void;
  onToggleFollow: () => void;
};

export function PublicProfileStickyHeader({
  visible,
  username,
  avatarUrl,
  following,
  followBusy,
  onBack,
  onToggleFollow,
}: PublicProfileStickyHeaderProps) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  const handle = username.trim() || "usuario";

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]} pointerEvents="box-none">
      <View style={styles.bar}>
        <Pressable onPress={onBack} style={styles.back} accessibilityLabel="Volver">
          <Text style={styles.backText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            ←
          </Text>
        </Pressable>
        <UserAvatar src={avatarUrl ?? ""} username={handle} size={32} />
        <Text style={styles.handle} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          @{handle}
        </Text>
        <Pressable
          onPress={onToggleFollow}
          disabled={followBusy}
          style={({ pressed }) => [
            followStyles.base,
            styles.followCompact,
            following ? followStyles.following : followStyles.primary,
            pressed ? followStyles.pressed : null,
            followBusy ? followStyles.busy : null,
          ]}
        >
          {followBusy ? (
            <ActivityIndicator color={following ? AUTH.gold : "#0a0a0c"} size="small" />
          ) : (
            <Text
              style={following ? followStyles.textFollowing : followStyles.textPrimary}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {following ? "Siguiendo" : "Seguir"}
            </Text>
          )}
        </Pressable>
      </View>
      <GoiGoldFadeLine variant="subtle" thickness={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 20,
    backgroundColor: "rgba(10, 10, 12, 0.92)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(82, 82, 82, 0.4)",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  back: {
    padding: 4,
  },
  backText: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "600",
  },
  handle: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  followCompact: {
    minWidth: 0,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
});
