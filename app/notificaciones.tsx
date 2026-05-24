import { Redirect, Stack } from "expo-router";
import { NotificationsTabScreen } from "../components/notifications/NotificationsTabScreen";
import { useAuth } from "../context/AuthContext";

export default function NotificacionesScreen() {
  const { isHydrated, isAuthenticated } = useAuth();

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
