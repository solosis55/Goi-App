import AsyncStorage from "@react-native-async-storage/async-storage";
import { LAST_LOGIN_EMAIL_KEY } from "../constants/storageKeys";

export async function loadLastLoginEmail(): Promise<string | null> {
  try {
    const v = await AsyncStorage.getItem(LAST_LOGIN_EMAIL_KEY);
    const t = v?.trim();
    return t && t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

export async function saveLastLoginEmail(email: string): Promise<void> {
  const t = email.trim();
  if (!t) {
    await AsyncStorage.removeItem(LAST_LOGIN_EMAIL_KEY);
    return;
  }
  await AsyncStorage.setItem(LAST_LOGIN_EMAIL_KEY, t);
}
