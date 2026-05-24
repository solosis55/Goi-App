import { StyleSheet } from "react-native";
import { AUTH } from "../../constants/authUi";

/** Estilos compartidos del CTA Seguir / Siguiendo en perfiles ajenos. */
export const profileFollowButtonStyles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    minWidth: 108,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: AUTH.gold,
    borderWidth: 1,
    borderColor: "rgba(240, 216, 120, 0.45)",
  },
  following: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.48)",
  },
  textPrimary: {
    color: "#0a0a0c",
    fontSize: 14,
    fontWeight: "700",
  },
  textFollowing: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  busy: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
