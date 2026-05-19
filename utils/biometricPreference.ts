import AsyncStorage from "@react-native-async-storage/async-storage";
import { BIOMETRIC_UNLOCK_KEY } from "../constants/storageKeys";

export async function getBiometricUnlockEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(BIOMETRIC_UNLOCK_KEY);
  return v === "1";
}

export async function setBiometricUnlockEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(BIOMETRIC_UNLOCK_KEY, "1");
  } else {
    await AsyncStorage.removeItem(BIOMETRIC_UNLOCK_KEY);
  }
}
