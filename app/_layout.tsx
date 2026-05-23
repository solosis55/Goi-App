import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { AuthNavigationSync } from "../context/AuthNavigationSync";

function ThemedRoot() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config} colorMode="dark">
        <AuthProvider>
          <AuthNavigationSync />
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="index"
          >
            <Stack.Screen name="index" options={{ animation: "fade_from_bottom", animationDuration: 420 }} />
            <Stack.Screen name="(tabs)" options={{ animation: "fade_from_bottom", animationDuration: 420 }} />
            <Stack.Screen name="feed" options={{ animation: "none" }} />
            <Stack.Screen
              name="nueva-publicacion"
              options={{ animation: "fade", presentation: "fullScreenModal" }}
            />
            <Stack.Screen name="editar-publicacion" options={{ animation: "fade", presentation: "modal" }} />
            <Stack.Screen
              name="nueva-historia"
              options={{ animation: "fade_from_bottom", animationDuration: 420, presentation: "modal" }}
            />
            <Stack.Screen
              name="camara-historia"
              options={{ animation: "fade", presentation: "fullScreenModal" }}
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
            <Stack.Screen name="perfil" options={{ animation: "none" }} />
            <Stack.Screen
              name="usuario/[id]"
              options={{ animation: "slide_from_right", presentation: "card" }}
            />
            <Stack.Screen name="rutina/nueva" options={{ animation: "slide_from_right", presentation: "card" }} />
            <Stack.Screen name="rutina/[id]" options={{ animation: "slide_from_right", presentation: "card" }} />
            <Stack.Screen name="entrenar/[workoutId]" options={{ animation: "slide_from_right", presentation: "card" }} />
          </Stack>
        </AuthProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedRoot />
    </GestureHandlerRootView>
  );
}
