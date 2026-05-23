import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeRestSec, WORKOUT_DEFAULT_REST_SEC } from "../constants/workoutRest";
import { WORKOUT_REST_PREF_KEY } from "../constants/storageKeys";

export async function readWorkoutRestPreference(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_REST_PREF_KEY);
    if (!raw) return WORKOUT_DEFAULT_REST_SEC;
    const n = parseInt(raw, 10);
    return normalizeRestSec(n);
  } catch {
    return WORKOUT_DEFAULT_REST_SEC;
  }
}

export async function writeWorkoutRestPreference(seconds: number): Promise<void> {
  try {
    await AsyncStorage.setItem(WORKOUT_REST_PREF_KEY, String(normalizeRestSec(seconds)));
  } catch {
    /* ignore */
  }
}
