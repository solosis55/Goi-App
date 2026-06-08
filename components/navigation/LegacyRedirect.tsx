import { Redirect, type Href } from "expo-router";

/** Redirect de rutas legacy (`app/(legacy)/*`) hacia tabs actuales. */
export function LegacyRedirect({ href }: { href: Href }) {
  return <Redirect href={href} />;
}
