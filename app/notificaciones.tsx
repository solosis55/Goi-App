import { Redirect, Stack } from "expo-router";
import { NotificationsTabScreen } from "../components/notifications/NotificationsTabScreen";
import { useAuth } from "../context/AuthContext";
import { useSocialBadgePolling } from "../hooks/useSocialBadgePolling";

export default function NotificacionesScreen() {
  const { isHydrated, isAuthenticated } = useAuth();
  useSocialBadgePolling(isAuthenticated);

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NotificationsTabScreen showBack />
    </>
  );
}
