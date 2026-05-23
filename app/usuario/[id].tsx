import { Redirect, useLocalSearchParams } from "expo-router";
import { ExternalProfileScreen } from "../../components/profile/ExternalProfileScreen";

export default function UsuarioProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = typeof id === "string" ? id.trim() : "";

  if (!userId) {
    return <Redirect href="/(tabs)" />;
  }

  return <ExternalProfileScreen userId={userId} />;
}
