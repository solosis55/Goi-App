import { useKeepAwake } from "expo-keep-awake";

const KEEP_AWAKE_TAG = "goi-workout-perform";

/** Mantiene la pantalla encendida mientras el componente está montado. */
export function WorkoutKeepAwake() {
  useKeepAwake(KEEP_AWAKE_TAG);
  return null;
}
