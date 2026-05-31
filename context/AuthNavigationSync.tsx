import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import { onAuthExpired } from "../api/authEvents";

/**
 * Cuando la API responde 401 y se limpia la sesión, fuerza la pila a `/login`
 * para no quedarse en pantallas protegidas sin token.
 */
export function AuthNavigationSync() {
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;
    return onAuthExpired((detail) => {
      const stale = detail?.code === "AUTH_SESSION_STALE";
      router.replace({
        pathname: "/login",
        params: stale ? { sessionExpired: "1", stale: "1" } : { sessionExpired: "1" },
      });
    });
  }, [navigationState?.key, router]);

  return null;
}
