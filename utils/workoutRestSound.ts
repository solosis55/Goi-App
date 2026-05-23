import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { WORKOUT_REST_SOUND_KEY } from "../constants/storageKeys";
import { workoutHapticSuccess } from "./workoutHaptics";

export async function readWorkoutRestSoundEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_REST_SOUND_KEY);
    if (raw === null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

export async function writeWorkoutRestSoundEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(WORKOUT_REST_SOUND_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function playRestBeepWeb(): void {
  if (typeof globalThis.window === "undefined") return;
  try {
    const W = globalThis as typeof globalThis & {
      AudioContext?: new () => AudioContext;
      webkitAudioContext?: new () => AudioContext;
    };
    const Ctx = W.AudioContext ?? W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.36);
    osc.onended = () => void ctx.close();
  } catch {
    /* sin Web Audio */
  }
}

async function playRestBeepNative(): Promise<void> {
  try {
    const Haptics = await import("expo-haptics");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 120));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    workoutHapticSuccess();
  }
}

/** Vibración al terminar el descanso; tono/beep si el aviso de sonido está activo. */
export async function playRestCompleteFeedback(soundEnabled: boolean): Promise<void> {
  workoutHapticSuccess();
  if (!soundEnabled) return;
  if (Platform.OS === "web") {
    playRestBeepWeb();
    return;
  }
  await playRestBeepNative();
}
