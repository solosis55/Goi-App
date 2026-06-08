import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { formatPostRelative } from "../../utils/feedPostDate";
import { visibilityBadgeStyle, visibilityLabel } from "../../utils/visibilityStyles";
import { UserAvatar } from "../ui/UserAvatar";
import { ScrollAwarePressable } from "../ui/ScrollAwarePressable";

type PostCardHeaderProps = {
  authorUsername: string;
  authorAvatarSrc: string;
  createdAt: string;
  isOwner: boolean;
  isTrainingPost: boolean;
  visibility: "public" | "followers" | "private";
  canOpenAuthor: boolean;
  canManage: boolean;
  canOverflow: boolean;
  deleting?: boolean;
  guardScrollPresses: boolean;
  compact?: boolean;
  onOpenAuthor: () => void;
  onOpenMenu: () => void;
};

export function PostCardHeader({
  authorUsername,
  authorAvatarSrc,
  createdAt,
  isOwner,
  isTrainingPost,
  visibility,
  canOpenAuthor,
  canManage,
  canOverflow,
  deleting,
  guardScrollPresses,
  compact = false,
  onOpenAuthor,
  onOpenMenu,
}: PostCardHeaderProps) {
  const showVisBadge = visibility !== "public";
  const visStyle = visibilityBadgeStyle(visibility);

  return (
    <View style={compact ? [styles.headerPad, styles.headerPadCompact] : styles.headerPad}>
      <View style={styles.headerRow}>
        <ScrollAwarePressable
          scrollGuarded={guardScrollPresses}
          onPress={onOpenAuthor}
          disabled={!canOpenAuthor}
          style={({ pressed }) => [styles.authorTap, pressed && canOpenAuthor ? styles.hitPressed : null]}
          accessibilityRole={canOpenAuthor ? "button" : undefined}
          accessibilityLabel={canOpenAuthor ? `Ver perfil de ${authorUsername}` : undefined}
        >
          <View style={styles.avatarSlot}>
            <UserAvatar src={authorAvatarSrc} username={authorUsername} size={46} />
          </View>
        </ScrollAwarePressable>
        <ScrollAwarePressable
          scrollGuarded={guardScrollPresses}
          onPress={onOpenAuthor}
          disabled={!canOpenAuthor}
          style={({ pressed }) => [styles.metaCol, pressed && canOpenAuthor ? styles.hitPressed : null]}
        >
          <View style={styles.metaBorder}>
            <View style={styles.metaTop}>
              <Text style={styles.username} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {authorUsername}
                {isOwner ? <Text style={styles.ownerHint}> (tu)</Text> : null}
              </Text>
              <Text style={styles.dot} aria-hidden>
                ·
              </Text>
              <Text style={styles.time} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {formatPostRelative(createdAt)}
              </Text>
            </View>
            {isTrainingPost ? (
              <Text style={styles.trainingTag} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Training
              </Text>
            ) : null}
            {showVisBadge ? (
              <View
                style={[
                  styles.visBadge,
                  { borderColor: visStyle.borderColor, backgroundColor: visStyle.backgroundColor },
                ]}
              >
                <Text style={[styles.visText, { color: visStyle.color }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {visibilityLabel(visibility)}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollAwarePressable>
        {canManage || canOverflow ? (
          <ScrollAwarePressable
            scrollGuarded={guardScrollPresses}
            onPress={onOpenMenu}
            disabled={deleting}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              canManage ? "Opciones de tu publicación" : `Opciones de la publicación de ${authorUsername}`
            }
            style={({ pressed }) => [styles.menuBtn, pressed ? styles.hitPressed : null, deleting ? styles.menuDisabled : null]}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={AUTH.muted} />
            ) : (
              <Text style={styles.menuIcon}>⋯</Text>
            )}
          </ScrollAwarePressable>
        ) : (
          <View style={styles.menuSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#0a0a0c",
  },
  headerPadCompact: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  authorTap: {
    flexShrink: 0,
  },
  avatarSlot: {
    marginTop: 2,
    flexShrink: 0,
  },
  metaCol: {
    flex: 1,
    minWidth: 0,
  },
  metaBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(38, 38, 38, 0.55)",
    paddingBottom: 10,
  },
  metaTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  username: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  ownerHint: {
    color: AUTH.muted,
    fontWeight: "400",
  },
  dot: {
    color: AUTH.faint,
    fontSize: 13,
  },
  time: {
    color: AUTH.muted,
    fontSize: 13,
  },
  trainingTag: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  visBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  visText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 2,
  },
  menuSpacer: {
    width: 36,
  },
  menuIcon: {
    color: AUTH.neutral100,
    fontSize: 22,
    lineHeight: 24,
    marginTop: -4,
    fontWeight: "600",
  },
  menuDisabled: {
    opacity: 0.5,
  },
  hitPressed: {
    opacity: 0.85,
  },
});
