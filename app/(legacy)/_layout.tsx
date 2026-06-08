import { Stack } from "expo-router";

/** Redirects sin UI; rutas antiguas agrupadas para no mezclar con pantallas reales. */
export default function LegacyRoutesLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "none" }} />;
}
