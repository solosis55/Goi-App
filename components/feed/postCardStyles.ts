import { Platform, StyleSheet } from "react-native";
import { AUTH } from "../../constants/authUi";

export const postCardStyles = StyleSheet.create({
  cardWrap: {
    position: "relative",
    overflow: "visible",
    width: "100%",
  },
  card: {
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "#0a0a0c",
    ...Platform.select({
      ios: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: { elevation: 0 },
      default: {},
    }),
  },
  cardClip: {
    overflow: "hidden",
    borderRadius: 0,
  },
  highlightRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
    zIndex: 3,
  },
  cardTextOnly: {
    backgroundColor: "#0a0a0c",
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
    position: "relative",
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
