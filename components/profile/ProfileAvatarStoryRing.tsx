import { Pressable, StyleSheet, View } from "react-native";
import { AUTH } from "../../constants/authUi";
import { UserAvatar } from "../ui/UserAvatar";

type ProfileAvatarStoryRingProps = {
  src?: string | null;
  username: string;
  size: number;
  unseenDaily?: boolean;
  onPress?: () => void;
};

export function ProfileAvatarStoryRing({
  src,
  username,
  size,
  unseenDaily = false,
  onPress,
}: ProfileAvatarStoryRingProps) {
  const ringPad = unseenDaily ? 3 : 0;
  const outer = size + ringPad * 2;

  const inner = (
    <View
      style={[
        styles.ring,
        { width: outer, height: outer, borderRadius: outer / 2 },
        unseenDaily ? styles.ringUnseen : null,
      ]}
    >
      <UserAvatar src={src} username={username} size={size} />
    </View>
  );

  if (!onPress) return inner;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={unseenDaily ? "Ver GoI Daily nuevo" : "Ver GoI Daily"}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringUnseen: {
    borderWidth: 3,
    borderColor: AUTH.gold,
  },
  pressed: {
    opacity: 0.9,
  },
});
