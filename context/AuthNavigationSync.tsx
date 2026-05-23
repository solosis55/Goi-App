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
    return onAuthExpired(() => {
      router.replace("/login");
    });
  }, [navigationState?.key, router]);

  return null;
}
