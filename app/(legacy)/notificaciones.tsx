import { LegacyRedirect } from "../../components/navigation/LegacyRedirect";
import { SOCIAL_ACTIVITY_HREF } from "../../constants/appRoutes";

export default function NotificacionesRedirect() {
  return <LegacyRedirect href={SOCIAL_ACTIVITY_HREF} />;
}
