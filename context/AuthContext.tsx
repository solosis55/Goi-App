import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { onAuthExpired } from "../api/authEvents";
import { clearStoredAuth, loadStoredAuth, persistAuth } from "../api/session";
import type { SafeUser } from "../types/auth";
import { getBiometricUnlockEnabled, setBiometricUnlockEnabled } from "../utils/biometricPreference";

type AuthState = {
  /** `true` tras leer almacenamiento al arranque (y biometría si aplica). */
  isHydrated: boolean;
  isAuthenticated: boolean;
  user: SafeUser | null;
  token: string | null;
  /** Nativo: el usuario activó desbloqueo biométrico al abrir la app. */
  biometricUnlockActive: boolean;
  signIn: (token: string, user: SafeUser) => Promise<void>;
  signOut: () => Promise<void>;
  /** Tras aceptar el aviso post-login (solo actualiza estado en memoria; la pref ya está guardada). */
  notifyBiometricUnlockOptIn: () => void;
  /** Desactiva la pref biométrica sin cerrar sesión. */
  disableBiometricUnlock: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [biometricUnlockActive, setBiometricUnlockActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const markHydrated = () => {
      if (!cancelled) setIsHydrated(true);
    };
    const failsafe = setTimeout(markHydrated, 3000);

    const run = async () => {
      try {
        const [auth, bioPref] = await Promise.all([loadStoredAuth(), getBiometricUnlockEnabled()]);
        if (cancelled) return;

        let nextToken = auth.token;
        let nextUser = auth.user;
        let nextBioActive = false;

        if (nextToken && nextUser && Platform.OS !== "web" && bioPref) {
          const r = await LocalAuthentication.authenticateAsync({
            promptMessage: "Desbloquear Goi",
            cancelLabel: "Usar contraseña",
          });
          if (!r.success) {
            await clearStoredAuth();
            await setBiometricUnlockEnabled(false);
            nextToken = null;
            nextUser = null;
            nextBioActive = false;
          } else {
            nextBioActive = true;
          }
        } else if (nextToken && nextUser) {
          nextBioActive = Platform.OS !== "web" && bioPref;
        } else {
          if (bioPref) await setBiometricUnlockEnabled(false);
          nextBioActive = false;
        }

        if (!cancelled) {
          setToken(nextToken);
          setUser(nextUser);
          setBiometricUnlockActive(nextBioActive);
        }
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setBiometricUnlockActive(false);
        }
      } finally {
        clearTimeout(failsafe);
        markHydrated();
      }
    };

    void run();

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    return onAuthExpired(() => {
      setToken(null);
      setUser(null);
      setBiometricUnlockActive(false);
    });
  }, []);

  const notifyBiometricUnlockOptIn = useCallback(() => {
    setBiometricUnlockActive(true);
  }, []);

  const disableBiometricUnlock = useCallback(async () => {
    await setBiometricUnlockEnabled(false);
    setBiometricUnlockActive(false);
  }, []);

  const signIn = useCallback(async (nextToken: string, nextUser: SafeUser) => {
    await persistAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    await setBiometricUnlockEnabled(false);
    setBiometricUnlockActive(false);
    await clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isHydrated,
      isAuthenticated: Boolean(token && user),
      user,
      token,
      biometricUnlockActive,
      signIn,
      signOut,
      notifyBiometricUnlockOptIn,
      disableBiometricUnlock,
    }),
    [
      isHydrated,
      user,
      token,
      biometricUnlockActive,
      signIn,
      signOut,
      notifyBiometricUnlockOptIn,
      disableBiometricUnlock,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
