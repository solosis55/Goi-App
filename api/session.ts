import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { AUTH_SECURE_STORAGE_KEY, AUTH_STORAGE_KEY } from "../constants/storageKeys";
import type { SafeUser } from "../types/auth";
import { mergeSafeUser } from "../utils/mergeSafeUser";

let tokenCache: string | null = null;
let cacheLoaded = false;

function invalidateMemoryCache() {
  tokenCache = null;
  cacheLoaded = false;
}

async function readPersistedAuthRaw(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(AUTH_STORAGE_KEY);
  }
  try {
    const secured = await SecureStore.getItemAsync(AUTH_SECURE_STORAGE_KEY);
    if (secured) return secured;
  } catch {
    /* SecureStore no disponible en algunos entornos */
  }
  const legacy = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (legacy) {
    try {
      await SecureStore.setItemAsync(AUTH_SECURE_STORAGE_KEY, legacy);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* migración fallida: se sigue usando el JSON legacy en memoria esta vez */
    }
    return legacy;
  }
  return null;
}

async function writePersistedAuthRaw(json: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, json);
    return;
  }
  await SecureStore.setItemAsync(AUTH_SECURE_STORAGE_KEY, json);
  const legacy = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (legacy) await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

async function removePersistedAuthRaw(): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(AUTH_SECURE_STORAGE_KEY);
  } catch {
    /* clave ausente */
  }
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

async function ensureTokenLoaded(): Promise<void> {
  if (cacheLoaded) return;
  try {
    const raw = await readPersistedAuthRaw();
    if (!raw) {
      tokenCache = null;
      cacheLoaded = true;
      return;
    }
    const parsed = JSON.parse(raw) as { token?: string };
    tokenCache = typeof parsed.token === "string" ? parsed.token : null;
    cacheLoaded = true;
  } catch {
    tokenCache = null;
    cacheLoaded = true;
  }
}

/** JWT actual (lee almacenamiento persistente la primera vez; luego cache en memoria). */
export async function getAuthToken(): Promise<string | null> {
  await ensureTokenLoaded();
  return tokenCache;
}

export async function loadStoredAuth(): Promise<{ token: string | null; user: SafeUser | null }> {
  try {
    const raw = await readPersistedAuthRaw();
    if (!raw) {
      invalidateMemoryCache();
      return { token: null, user: null };
    }
    const parsed = JSON.parse(raw) as { token?: string; user?: SafeUser };
    const token = typeof parsed.token === "string" ? parsed.token : null;
    const user = parsed.user && typeof parsed.user === "object" ? mergeSafeUser(parsed.user) : null;
    tokenCache = token;
    cacheLoaded = true;
    return { token, user };
  } catch {
    invalidateMemoryCache();
    return { token: null, user: null };
  }
}

/** Persiste sesión en el mismo formato que Goi Web (`goi-auth`). En iOS/Android usa SecureStore. */
export async function persistAuth(token: string, user: SafeUser): Promise<void> {
  const merged = mergeSafeUser(user);
  await writePersistedAuthRaw(JSON.stringify({ token, user: merged }));
  tokenCache = token;
  cacheLoaded = true;
}

export async function clearStoredAuth(): Promise<void> {
  await removePersistedAuthRaw();
  invalidateMemoryCache();
}
