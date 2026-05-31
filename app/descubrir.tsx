import { Redirect } from "expo-router";

/** Ruta legacy: abre búsqueda dentro de la pestaña Social. */
export default function DescubrirRedirect() {
  return <Redirect href={{ pathname: "/(tabs)/social", params: { discover: "1" } }} />;
}
