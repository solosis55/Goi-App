import AsyncStorage from "@react-native-async-storage/async-storage";
import { FEED_GOLD_BEAM_ENABLED_KEY } from "../constants/storageKeys";

export async function loadFeedGoldBeamEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(FEED_GOLD_BEAM_ENABLED_KEY);
    if (raw === "0") return false;
    return true;
  } catch {
    return true;
  }
}

export async function saveFeedGoldBeamEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(FEED_GOLD_BEAM_ENABLED_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}
