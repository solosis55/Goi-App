import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { visibilityBadgeStyle, visibilityLabel } from "../../../utils/visibilityStyles";
import { UserAvatar } from "../../ui/UserAvatar";
import { postPreviewCardStyles } from "./postPreviewCardStyles";
import type { PostPreviewDraft } from "./postPreviewTypes";

type PostPreviewCardHeaderProps = {
  draft: PostPreviewDraft;
  compact?: boolean;
  avatarSize: number;
  /** Texto tras visibilidad, p. ej. " · ahora" o " · Training · ahora". */
  metaSuffix: string;
  headVariant?: "default" | "roomy";
  userFontSize?: number;
  /** Igual que `PostCardHeader` en el feed (composer en previewMode). */
  feedMatch?: boolean;
};

export function PostPreviewCardHeader({
  draft,
  compact = false,
  avatarSize,
  metaSuffix,
  headVariant = "default",
  userFontSize,
  feedMatch = false,
}: PostPreviewCardHeaderProps) {
  const showVisBadge = draft.visibility !== "public";
  const visStyle = visibilityBadgeStyle(draft.visibility);
  const isTraining = draft.format === "training";

  if (feedMatch) {
    return (
      <View style={feedStyles.headerPad}>
        <View style={feedStyles.headerRow}>
          <View style={feedStyles.avatarSlot}>
            <UserAvatar src={draft.avatarUrl} username={draft.username} size={46} />
          </View>
          <View style={feedStyles.metaCol}>
            <View style={feedStyles.metaBorder}>
              <View style={feedStyles.metaTop}>
                <Text style={feedStyles.username} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {draft.username}
                  <Text style={feedStyles.ownerHint}> (tu)</Text>
                </Text>
                <Text style={feedStyles.dot} aria-hidden>
                  ·
                </Text>
                <Text style={feedStyles.time} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  ahora
                </Text>
              </View>
              {isTraining ? (
                <Text style={feedStyles.trainingTag} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Training
                </Text>
              ) : null}
              {showVisBadge ? (
                <View
                  style={[
                    feedStyles.visBadge,
                    { borderColor: visStyle.borderColor, backgroundColor: visStyle.backgroundColor },
                  ]}
                >
                  <Text
                    style={[feedStyles.visText, { color: visStyle.color }]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    {visibilityLabel(draft.visibility)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={feedStyles.menuSpacer} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        postPreviewCardStyles.head,
        compact ? postPreviewCardStyles.headCompact : null,
        !compact && headVariant === "roomy" ? { paddingVertical: 12 } : null,
      ]}
    >
      <UserAvatar src={draft.avatarUrl} username={draft.username} size={avatarSize} />
      <View style={postPreviewCardStyles.headMeta}>
        <Text
          style={[
            postPreviewCardStyles.user,
            compact ? postPreviewCardStyles.userCompact : null,
            userFontSize != null ? { fontSize: userFontSize } : null,
          ]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          numberOfLines={1}
        >
          @{draft.username}
        </Text>
        <Text
          style={[postPreviewCardStyles.meta, compact ? postPreviewCardStyles.metaCompact : null]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          {visibilityLabel(draft.visibility)}
          {metaSuffix}
        </Text>
      </View>
    </View>
  );
}

const feedStyles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#0a0a0c",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  visText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  menuSpacer: {
    width: 36,
    flexShrink: 0,
  },
});
