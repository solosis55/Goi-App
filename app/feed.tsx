import { Redirect } from "expo-router";
import { MAIN_TABS_HREF } from "../constants/appRoutes";

/** Compatibilidad: rutas antiguas que apuntaban a `/feed`. */
export default function FeedRedirect() {
  return <Redirect href={MAIN_TABS_HREF} />;
}
