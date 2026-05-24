import { Redirect } from "expo-router";
import { SocialHubScreen } from "../../components/social/SocialHubScreen";
import { useAuth } from "../../context/AuthContext";

export default function SocialTab() {
  const { isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <SocialHubScreen title="Social" />;
}
