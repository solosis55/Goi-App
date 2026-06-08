import { Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { visibilityLabel } from "../../../utils/visibilityStyles";
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
};

export function PostPreviewCardHeader({
  draft,
  compact = false,
  avatarSize,
  metaSuffix,
  headVariant = "default",
  userFontSize,
}: PostPreviewCardHeaderProps) {
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
