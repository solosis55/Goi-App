import { LegacyRedirect } from "../../components/navigation/LegacyRedirect";
import { SOCIAL_DISCOVER_HREF } from "../../constants/appRoutes";

export default function DescubrirRedirect() {
  return <LegacyRedirect href={SOCIAL_DISCOVER_HREF} />;
}
