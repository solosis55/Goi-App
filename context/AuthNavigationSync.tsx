import { useRouter } from "expo-router";
import { useEffect } from "react";
import { onAuthExpired } from "../api/authEvents";

/**
 * Cuando la API responde 401 y se limpia la sesión, fuerza la pila a `/login`
 * para no quedarse en pantallas protegidas sin token.
 */
export function AuthNavigationSync() {
  const router = useRouter();

  useEffect(() => {
    return onAuthExpired(() => {
      router.replace("/login");
    });
  }, [router]);

  return null;
}
