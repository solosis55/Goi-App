import { LegacyRedirect } from "../../components/navigation/LegacyRedirect";
import { PROFILE_TAB_HREF } from "../../constants/appRoutes";

export default function PerfilRedirect() {
  return <LegacyRedirect href={PROFILE_TAB_HREF} />;
}
