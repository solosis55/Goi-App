import { StyleSheet } from "react-native";
import { AUTH } from "../../../constants/authUi";
import { WORKOUT_UI, workoutScreenStyles } from "../../../constants/workoutScreenUi";

export const performSetCardStyles = StyleSheet.create({
  variantCard: {
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: WORKOUT_UI.border,
    backgroundColor: "rgba(10, 10, 12, 0.55)",
    borderLeftWidth: 3,
    overflow: "hidden",
  },
  variantCardDone: {
    backgroundColor: "rgba(22, 40, 28, 0.35)",
    opacity: 0.92,
  },
  variantCardActive: {
    backgroundColor: "rgba(48, 44, 28, 0.5)",
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  variantHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WORKOUT_UI.border,
  },
  variantBody: {
    padding: 8,
    gap: 8,
  },
  setNum: {
    width: 22,
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    flexShrink: 0,
  },
  headSpacer: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  metaLabel: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 0,
  },
  metaInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    maxWidth: 120,
  },
  metaSuffix: {
    color: AUTH.faint,
    fontSize: 12,
    fontWeight: "600",
  },
  subStepCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    padding: 8,
    gap: 8,
  },
  subStepHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  subStepTitle: {
    color: AUTH.steel,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  subStepFields: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subField: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  subFieldLabel: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "600",
  },
  subInput: {
    minHeight: 42,
  },
  removeSubBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  removeSubText: {
    color: AUTH.danger,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  addSubBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: WORKOUT_UI.border,
  },
  addSubText: workoutScreenStyles.linkText,
  pressed: {
    opacity: 0.88,
  },
  inputDone: {
    opacity: 0.65,
  },
});
