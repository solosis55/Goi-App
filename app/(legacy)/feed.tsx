import { LegacyRedirect } from "../../components/navigation/LegacyRedirect";
import { MAIN_TABS_HREF } from "../../constants/appRoutes";

export default function FeedRedirect() {
  return <LegacyRedirect href={MAIN_TABS_HREF} />;
}
