import { Platform, StyleSheet } from "react-native";
import { AUTH } from "../../constants/authUi";

export const postCardStyles = StyleSheet.create({
  cardWrap: {
    position: "relative",
    overflow: "visible",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.14)",
    backgroundColor: "#0a0a0c",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.42,
        shadowRadius: 18,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  cardClip: {
    overflow: "hidden",
    borderRadius: 16,
  },
  highlightRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    zIndex: 3,
  },
  cardTextOnly: {
    backgroundColor: "rgba(22, 20, 14, 0.72)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(212, 175, 55, 0.42)",
  },
  cardTraining: {
    borderLeftWidth: 3,
    borderLeftColor: "rgba(212, 175, 55, 0.55)",
  },
  mediaBlock: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#1c1c1f",
  },
  actionBarPad: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 2,
    backgroundColor: "#0a0a0c",
  },
  bodyPad: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: "#0a0a0c",
  },
  bodyPadCompact: {
    paddingTop: 8,
  },
  content: {
    color: AUTH.neutral100,
    fontSize: 16,
    lineHeight: 24,
  },
  contentTextOnly: {
    fontSize: 17,
    lineHeight: 26,
  },
});
