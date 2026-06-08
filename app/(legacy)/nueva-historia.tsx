import { LegacyRedirect } from "../../components/navigation/LegacyRedirect";
import { camaraHistoriaHref } from "../../constants/storyRoutes";

export default function NuevaHistoriaRedirect() {
  return <LegacyRedirect href={camaraHistoriaHref()} />;
}
