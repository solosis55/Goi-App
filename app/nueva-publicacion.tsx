import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { CreatePostScreen } from "../components/post/CreatePostScreen";
import { useAuth } from "../context/AuthContext";

export default function NuevaPublicacionScreen() {
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "fullScreenModal", animation: "fade" }} />
      <CreatePostScreen />
    </>
  );
}
