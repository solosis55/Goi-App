import { Redirect } from "expo-router";

/** Compatibilidad: rutas antiguas que apuntaban a `/perfil`. */
export default function PerfilRedirect() {
  return <Redirect href="/(tabs)/perfil" />;
}
