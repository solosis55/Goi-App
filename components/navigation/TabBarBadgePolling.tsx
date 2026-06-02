import { useAuth } from "../../context/AuthContext";
import { useSocialBadgePolling } from "../../hooks/useSocialBadgePolling";

/** Polling de badges; vive en la tab bar para no re-renderizar todo el layout de tabs. */
export function TabBarBadgePolling({ socialTabActive }: { socialTabActive: boolean }) {
  const { isAuthenticated } = useAuth();
  useSocialBadgePolling(isAuthenticated, { fast: socialTabActive });
  return null;
}
