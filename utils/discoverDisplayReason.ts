import type { DiscoverUser } from "../types/auth";

/** Motivo de sugerencia del servidor; no sustituir por bio salvo ausencia total. */
export function discoverDisplayReason(user: DiscoverUser): string {
  const reason = user.reason?.trim();
  if (reason) return reason;
  const goal = user.goal?.trim();
  if (goal) return goal;
  return "Perfil en GoI";
}
