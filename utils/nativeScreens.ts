import { enableFreeze, enableScreens } from "react-native-screens";

let configured = false;

/** Congela pantallas fuera de foco (menos trabajo al cambiar de tab). Idempotente. */
export function configureNativeScreens() {
  if (configured) return;
  configured = true;
  enableScreens(true);
  enableFreeze(true);
}
