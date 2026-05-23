import { Redirect } from "expo-router";
import { camaraHistoriaHref } from "../constants/storyRoutes";

/** Redirige a la cámara in-app (ruta antigua). */
export default function NuevaHistoriaRedirect() {
  return <Redirect href={camaraHistoriaHref()} />;
}
