import { SocialHubScreen } from "./SocialHubScreen";

type SocialDiscoverScreenProps = {
  showBack?: boolean;
  title?: string;
};

/** Alias del hub social (p. ej. ruta /descubrir con botón atrás). */
export function SocialDiscoverScreen(props: SocialDiscoverScreenProps) {
  return <SocialHubScreen {...props} />;
}
