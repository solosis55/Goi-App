import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { AUTH } from "../../../constants/authUi";
import { POST_PREVIEW_CARD } from "./postPreviewTheme";

export const postPreviewCardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 0,
    overflow: "hidden",
  },
  cardBleed: {
    marginHorizontal: 0,
    borderLeftWidth: 1,
    borderRightWidth: 0,
  },
  cardEmbedded: {
    borderRadius: 12,
  },
  cardFrameless: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headCompact: {
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headMeta: { flex: 1, gap: 2 },
  user: { color: AUTH.neutral100, fontSize: 14, fontWeight: "700" },
  userCompact: { fontSize: 13 },
  meta: { color: POST_PREVIEW_CARD.metaColor, fontSize: 11, fontWeight: "500" },
  metaCompact: { fontSize: 10 },
  previewHint: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    textAlign: "center",
  },
});

type PreviewCardShellOptions = {
  cardWidth: number;
  fullBleed?: boolean;
  isEmbedded?: boolean;
  embedded?: boolean;
};

export function previewCardShellStyle({
  cardWidth,
  fullBleed = true,
  isEmbedded = false,
  embedded = false,
}: PreviewCardShellOptions): StyleProp<ViewStyle> {
  return [
    postPreviewCardStyles.card,
    {
      width: cardWidth,
      borderColor: POST_PREVIEW_CARD.border,
      backgroundColor: POST_PREVIEW_CARD.background,
    },
    fullBleed && !isEmbedded ? postPreviewCardStyles.cardBleed : null,
    isEmbedded && !embedded ? postPreviewCardStyles.cardEmbedded : null,
    embedded ? postPreviewCardStyles.cardFrameless : null,
  ];
}
