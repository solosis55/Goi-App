import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { SocialHubProvider } from "../context/SocialHubContext";
import { AuthNavigationSync } from "../context/AuthNavigationSync";
import { GoiAlertProvider } from "../context/GoiAlertContext";
import { GoiToastProvider } from "../context/GoiToastContext";
import {
  AUTH,
  APP_CARD_STACK_OPTIONS,
  APP_PROFILE_POST_STACK_OPTIONS,
  APP_STACK_CONTENT_STYLE,
} from "../constants/authUi";

function ThemedRoot() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config} colorMode="dark">
        <AuthProvider>
          <SocialHubProvider>
          <GoiAlertProvider>
            <GoiToastProvider>
              <AuthNavigationSync />
              <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: APP_STACK_CONTENT_STYLE,
            }}
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
            <Stack.Screen name="usuario/[id]" options={APP_CARD_STACK_OPTIONS} />
            <Stack.Screen name="rutina/nueva" options={APP_CARD_STACK_OPTIONS} />
            <Stack.Screen name="rutina/[id]" options={APP_CARD_STACK_OPTIONS} />
            <Stack.Screen name="entrenar/[workoutId]" options={APP_CARD_STACK_OPTIONS} />
            <Stack.Screen name="sesion/[id]" options={APP_CARD_STACK_OPTIONS} />
            <Stack.Screen name="descubrir" options={APP_CARD_STACK_OPTIONS} />
            <Stack.Screen name="lista-social" options={APP_CARD_STACK_OPTIONS} />
            <Stack.Screen name="notificaciones" options={APP_CARD_STACK_OPTIONS} />
            <Stack.Screen name="publicacion/[id]" options={APP_PROFILE_POST_STACK_OPTIONS} />
              </Stack>
            </GoiToastProvider>
          </GoiAlertProvider>
          </SocialHubProvider>
        </AuthProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: AUTH.bg }}>
      <ThemedRoot />
    </GestureHandlerRootView>
  );
}
