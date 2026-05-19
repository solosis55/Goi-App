import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useGoiTheme } from "../constants/theme";
import { AuthProvider } from "../context/AuthContext";
import { AuthNavigationSync } from "../context/AuthNavigationSync";

function ThemedRoot() {
  const { colorScheme } = useGoiTheme();

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config} colorMode={colorScheme}>
        <AuthProvider>
          <AuthNavigationSync />
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="index"
          >
            <Stack.Screen name="index" options={{ animation: "fade_from_bottom", animationDuration: 420 }} />
            <Stack.Screen name="feed" options={{ animation: "fade_from_bottom", animationDuration: 420 }} />
            <Stack.Screen
              name="nueva-publicacion"
              options={{ animation: "fade_from_bottom", animationDuration: 420 }}
            />
            <Stack.Screen
              name="login"
              options={{
                animation: "fade_from_bottom",
                animationDuration: 420,
              }}
            />
            <Stack.Screen
              name="register"
              options={{
                animation: "fade_from_bottom",
                animationDuration: 420,
              }}
            />
            <Stack.Screen
              name="forgot-password"
              options={{
                animation: "fade_from_bottom",
                animationDuration: 420,
              }}
            />
          </Stack>
        </AuthProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return <ThemedRoot />;
}
