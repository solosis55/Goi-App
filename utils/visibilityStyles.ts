import { AUTH } from "../constants/authUi";

export function visibilityLabel(visibility: "public" | "followers" | "private"): string {
  if (visibility === "followers") return "Seguidores";
  if (visibility === "private") return "Solo yo";
  return "Público";
}

/** Estilos de pastilla de visibilidad (feed web, tema oscuro). */
export function visibilityBadgeStyle(visibility: "public" | "followers" | "private") {
  switch (visibility) {
    case "followers":
      return {
        borderColor: "rgba(212, 175, 55, 0.45)",
        backgroundColor: "rgba(212, 175, 55, 0.11)",
        color: AUTH.gold,
      };
    case "private":
      return {
        borderColor: "rgba(82, 82, 82, 0.9)",
        backgroundColor: "rgba(23, 23, 23, 0.75)",
        color: AUTH.muted,
      };
    default:
      return {
        borderColor: "rgba(6, 95, 70, 0.55)",
        backgroundColor: "rgba(6, 40, 30, 0.45)",
        color: "#a7f3d0",
      };
  }
}
