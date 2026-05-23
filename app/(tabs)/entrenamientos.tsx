import { Redirect, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppScreenShell } from "../../components/AppScreenShell";
import { WorkoutsListScreen } from "../../components/workouts/WorkoutsListScreen";
import { APP_STACK_SCREEN_OPTIONS } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";

export default function EntrenamientosScreen() {
  const { isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) {
    return <View style={styles.placeholder} />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          ...APP_STACK_SCREEN_OPTIONS,
          title: "Entrenamientos",
          headerShown: true,
        }}
      />
      <AppScreenShell>
        <WorkoutsListScreen />
      </AppScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: "#000",
  },
});
