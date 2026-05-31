import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollAwarePressable } from "../ui/ScrollAwarePressable";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { FeedHeartIcon } from "./FeedHeartIcon";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PostActionBarProps = {
  liked: boolean;
  likesCount: number;
  commentsCount?: number;
  onToggleLike: () => void;
  onPressComment: () => void;
  commentsExpanded?: boolean;
  onPressShare?: () => void;
  onPressLikesCount?: () => void;
  onPressCommentsCount?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
  /** Publicación estándar con sesión: alterna preview del entreno en el cuerpo del post. */
  onPressSessionPreview?: () => void;
  sessionPreviewActive?: boolean;
  guardScrollPresses?: boolean;
  compact?: boolean;
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

function ShareIcon({ color = AUTH.neutral100 }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 8l-8 4 8 4V8zM6 6h2v12H6V6zm10 0h2v12h-2V6z"
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

function bounceScale() {
  return withSequence(withSpring(1.28, { damping: 8, stiffness: 380 }), withSpring(1, { damping: 12 }));
}

function PostActionBarInner({
  liked,
  likesCount,
  commentsCount = 0,
  onToggleLike,
  onPressComment,
  commentsExpanded = false,
  onPressShare,
  onPressLikesCount,
  onPressCommentsCount,
  saved = false,
  onToggleSave,
  onPressSessionPreview,
  sessionPreviewActive = false,
  guardScrollPresses = false,
  compact = false,
}: PostActionBarProps) {
  const scrollGuarded = guardScrollPresses;
  const heartColor = liked ? AUTH.gold : AUTH.neutral100;
  const likeScale = useSharedValue(1);
  const saveScale = useSharedValue(1);

  const likeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const saveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const handleLike = () => {
    likeScale.value = bounceScale();
    onToggleLike();
  };

  const handleSave = () => {
    saveScale.value = bounceScale();
    onToggleSave?.();
  };

  const likesLabel = likesCount === 1 ? "1 me gusta" : `${likesCount} me gusta`;
  const commentsLabel =
    commentsCount === 1 ? "1 comentario" : `${commentsCount} comentarios`;

  const showSave = onToggleSave != null || compact;
  const showSession = Boolean(onPressSessionPreview);

  return (
    <View style={[styles.bar, compact ? styles.barCompact : null]}>
      <View style={styles.iconsRow}>
        <View style={[styles.icons, compact ? styles.iconsCompact : null]}>
        {scrollGuarded ? (
          <ScrollAwarePressable
            scrollGuarded
            onPress={handleLike}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: liked }}
            accessibilityLabel={liked ? "Quitar me gusta" : "Dar me gusta"}
            style={styles.iconBtn}
          >
            <Animated.View style={likeAnimStyle}>
              <FeedHeartIcon filled={liked} color={heartColor} size={26} />
            </Animated.View>
          </ScrollAwarePressable>
        ) : (
          <AnimatedPressable
            onPress={handleLike}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: liked }}
            accessibilityLabel={liked ? "Quitar me gusta" : "Dar me gusta"}
            style={({ pressed }) => [styles.iconBtn, likeAnimStyle, pressed ? styles.pressed : null]}
          >
            <FeedHeartIcon filled={liked} color={heartColor} size={26} />
          </AnimatedPressable>
        )}

        <ScrollAwarePressable
          scrollGuarded={scrollGuarded}
          onPress={onPressComment}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ expanded: commentsExpanded }}
          accessibilityLabel={commentsExpanded ? "Ocultar comentarios" : "Comentar"}
          style={({ pressed }) => [styles.iconBtn, pressed ? styles.pressed : null]}
        >
          <CommentIcon />
        </ScrollAwarePressable>

        {showSession && onPressSessionPreview ? (
          <ScrollAwarePressable
            scrollGuarded={scrollGuarded}
            onPress={onPressSessionPreview}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: sessionPreviewActive }}
            accessibilityLabel="Ver entreno vinculado"
            style={({ pressed }) => [
              styles.iconBtn,
              styles.sessionBtn,
              sessionPreviewActive ? styles.sessionBtnActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <TabDumbbellIcon size={22} color={AUTH.gold} filled />
          </ScrollAwarePressable>
        ) : null}

        {onPressShare ? (
          <ScrollAwarePressable
            scrollGuarded={scrollGuarded}
            onPress={onPressShare}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Compartir publicación"
            style={({ pressed }) => [styles.iconBtn, pressed ? styles.pressed : null]}
          >
            <ShareIcon />
          </ScrollAwarePressable>
        ) : null}
        </View>

        <View style={[styles.iconsRight, compact ? styles.iconsCompact : null]}>
          {showSave ? (
            onToggleSave ? (
              scrollGuarded ? (
                <ScrollAwarePressable
                  scrollGuarded
                  onPress={handleSave}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: saved }}
                  accessibilityLabel={saved ? "Quitar de guardados" : "Guardar publicación"}
                  style={styles.iconBtn}
                >
                  <Animated.View style={saveAnimStyle}>
                    <BookmarkIcon filled={saved} color={saved ? AUTH.gold : AUTH.neutral100} />
                  </Animated.View>
                </ScrollAwarePressable>
              ) : (
                <AnimatedPressable
                  onPress={handleSave}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: saved }}
                  accessibilityLabel={saved ? "Quitar de guardados" : "Guardar publicación"}
                  style={({ pressed }) => [styles.iconBtn, saveAnimStyle, pressed ? styles.pressed : null]}
                >
                  <BookmarkIcon filled={saved} color={saved ? AUTH.gold : AUTH.neutral100} />
                </AnimatedPressable>
              )
            ) : (
              <View style={styles.iconBtn} accessibilityLabel="Guardar publicación">
                <BookmarkIcon filled={false} color={AUTH.neutral100} />
              </View>
            )
          ) : null}
        </View>
      </View>

      {likesCount > 0 || commentsCount > 0 ? (
        <View style={styles.statsRow}>
          {likesCount > 0 ? (
            onPressLikesCount ? (
              <ScrollAwarePressable
                scrollGuarded={scrollGuarded}
                onPress={onPressLikesCount}
                hitSlop={6}
                accessibilityRole="button"
              >
                <Text style={styles.statsText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {likesLabel}
                </Text>
              </ScrollAwarePressable>
            ) : (
              <Text style={styles.statsText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {likesLabel}
              </Text>
            )
          ) : null}
          {likesCount > 0 && commentsCount > 0 ? (
            <Text style={styles.statsDot} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {" "}
              ·{" "}
            </Text>
          ) : null}
          {commentsCount > 0 ? (
            onPressCommentsCount ? (
              <ScrollAwarePressable
                scrollGuarded={scrollGuarded}
                onPress={onPressCommentsCount}
                hitSlop={6}
                accessibilityRole="button"
              >
                <Text style={styles.statsText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {commentsLabel}
                </Text>
              </ScrollAwarePressable>
            ) : (
              <Text style={styles.statsText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {commentsLabel}
              </Text>
            )
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export const PostActionBar = memo(PostActionBarInner);

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 6,
  },
  barCompact: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 2,
  },
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconsCompact: {
    gap: 12,
  },
  iconsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  sessionBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
  },
  sessionBtnActive: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "rgba(212, 175, 55, 0.55)",
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
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  statsText: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  statsDot: {
    color: AUTH.faint,
    fontSize: 14,
    fontWeight: "400",
  },
});
