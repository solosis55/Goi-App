import { Redirect } from "expo-router";
import { SocialTabRoot } from "../../components/social/SocialTabRoot";
import { useAuth } from "../../context/AuthContext";

export default function SocialTab() {
  const { isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <SocialTabRoot />;
}
