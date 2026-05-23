import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { FeedHeartIcon } from "./FeedHeartIcon";

type PostActionBarProps = {
  liked: boolean;
  likesCount: number;
  onToggleLike: () => void;
  onPressComment: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
};

function CommentIcon({ size = 24, color = AUTH.neutral100 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.38 8.38 0 0 1-3.9-.8L3 21l1.8-5.7a8.38 8.38 0 0 1-.8-3.9 8.5 8.5 0 0 1 3.1-6.6 8.38 8.38 0 0 1 5.4-1.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookmarkIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={filled ? color : "none"}>
      <Path
        d="M6 4h12a1 1 0 0 1 1 1v15.2a.6.6 0 0 1-.92.5L12 17.5l-6.08 3.2a.6.6 0 0 1-.92-.5V5a1 1 0 0 1 1-1Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PostActionBar({
  liked,
  likesCount,
  onToggleLike,
  onPressComment,
  saved = false,
  onToggleSave,
}: PostActionBarProps) {
  const heartColor = liked ? AUTH.gold : AUTH.neutral100;

  return (
    <View style={styles.bar}>
      <View style={styles.icons}>
        <Pressable
          onPress={onToggleLike}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          accessibilityLabel={liked ? "Quitar me gusta" : "Dar me gusta"}
          style={({ pressed }) => [styles.iconBtn, pressed ? styles.pressed : null]}
        >
          <FeedHeartIcon filled={liked} color={heartColor} size={26} />
        </Pressable>

        <Pressable
          onPress={onPressComment}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Comentar"
          style={({ pressed }) => [styles.iconBtn, pressed ? styles.pressed : null]}
        >
          <CommentIcon />
        </Pressable>

        {onToggleSave ? (
          <Pressable
            onPress={onToggleSave}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: saved }}
            accessibilityLabel={saved ? "Quitar de guardados" : "Guardar publicación"}
            style={({ pressed }) => [styles.iconBtn, pressed ? styles.pressed : null]}
          >
            <BookmarkIcon filled={saved} color={saved ? AUTH.gold : AUTH.neutral100} />
          </Pressable>
        ) : null}
      </View>

      {likesCount > 0 ? (
        <Text style={styles.likesLine} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {likesCount === 1 ? "1 me gusta" : `${likesCount} me gusta`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 6,
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  likesLine: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
});
