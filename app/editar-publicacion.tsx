import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { EditPostScreen } from "../components/post/EditPostScreen";
import { useAuth } from "../context/AuthContext";

export default function EditarPublicacionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator color="#d4af37" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!id?.trim()) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "modal", animation: "fade" }} />
      <EditPostScreen postId={id.trim()} />
    </>
  );
}
