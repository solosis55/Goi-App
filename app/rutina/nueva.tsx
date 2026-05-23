import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { WorkoutEditorScreen } from "../../components/workouts/WorkoutEditorScreen";
import { AUTH, APP_STACK_SCREEN_OPTIONS } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";

export default function NuevaRutinaScreen() {
  const { isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: AUTH.bg }}>
        <ActivityIndicator color={AUTH.gold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen options={{ ...APP_STACK_SCREEN_OPTIONS, presentation: "card" }} />
      <WorkoutEditorScreen mode="create" />
    </>
  );
}
