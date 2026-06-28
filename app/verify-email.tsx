import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { resendVerificationEmail, verifyEmailWithToken } from "../api/auth";
import { ApiError } from "../api/client";
import { AnimatedGoldButton } from "../components/auth/AnimatedGoldButton";
import { AuthTopGlow } from "../components/AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, authScreenStyles } from "../constants/authUi";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessages";

type Phase = "loading" | "success" | "error";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token: tokenParam, email: emailParam } = useLocalSearchParams<{ token?: string; email?: string }>();
  const token = typeof tokenParam === "string" ? tokenParam.trim() : "";
  const pendingEmail = typeof emailParam === "string" ? emailParam.trim() : "";
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isHydrated, isAuthenticated } = useAuth();

  const [phase, setPhase] = useState<Phase>(token ? "loading" : "error");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : "Falta el enlace de verificación.");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void verifyEmailWithToken(token)
      .then((res) => {
        if (cancelled) return;
        setPhase("success");
        setMessage(res.message === "email verified" ? "Email confirmado. Ya puedes iniciar sesión." : res.message);
      })
      .catch((e) => {
        if (cancelled) return;
        setPhase("error");
        setError(getErrorMessage(e, "No se pudo verificar el email"));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onResend = useCallback(async () => {
    if (!pendingEmail) {
      setError("Introduce tu email en el registro o inicio de sesión para reenviar el correo.");
      return;
    }
    setResendLoading(true);
    setError("");
    try {
      await resendVerificationEmail(pendingEmail);
      setMessage("Si el correo está registrado y aún no verificado, enviaremos un nuevo enlace.");
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo reenviar el correo"));
    } finally {
      setResendLoading(false);
    }
  }, [pendingEmail]);

  if (!isHydrated) {
    return (
      <View style={[authScreenStyles.root, authScreenStyles.center]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={AUTH.gold} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: phase === "success" ? "Email confirmado" : "Verificar email",
          headerShown: true,
          headerStyle: { backgroundColor: AUTH.bg },
          headerShadowVisible: false,
          headerTintColor: AUTH.gold,
          headerTitleStyle: { color: AUTH.neutral100, fontWeight: "600", fontSize: 17 },
        }}
      />
      <View style={authScreenStyles.root}>
        <StatusBar style="light" />
        <AuthTopGlow width={width} windowHeight={height} />
        <SafeAreaView style={authScreenStyles.safe} edges={["top", "left", "right"]}>
          <ScrollView
            contentContainerStyle={[
              authScreenStyles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 28 },
            ]}
          >
            <View style={authScreenStyles.card}>
              {phase === "loading" ? (
                <View style={{ alignItems: "center", paddingVertical: 24, gap: 12 }}>
                  <ActivityIndicator size="large" color={AUTH.gold} />
                  <Text style={authScreenStyles.cardSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Verificando tu email…
                  </Text>
                </View>
              ) : null}

              {phase === "success" ? (
                <>
                  <Text style={authScreenStyles.cardTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    ¡Listo!
                  </Text>
                  <Text style={authScreenStyles.cardSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {message}
                  </Text>
                  <AnimatedGoldButton
                    label="Iniciar sesión"
                    loadingLabel="Abriendo…"
                    loading={false}
                    onPress={() => router.replace("/login")}
                  />
                </>
              ) : null}

              {phase === "error" ? (
                <>
                  <Text style={authScreenStyles.cardTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    No se pudo verificar
                  </Text>
                  <Text style={authScreenStyles.cardSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {error}
                  </Text>
                  {message ? (
                    <View style={authScreenStyles.successBox}>
                      <Text style={authScreenStyles.successText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        {message}
                      </Text>
                    </View>
                  ) : null}
                  {pendingEmail ? (
                    <AnimatedGoldButton
                      label={resendLoading ? "Reenviando…" : "Reenviar correo"}
                      loadingLabel="Reenviando…"
                      loading={resendLoading}
                      disabled={resendLoading}
                      onPress={() => void onResend()}
                    />
                  ) : null}
                  <Pressable
                    onPress={() => router.replace("/login")}
                    style={({ pressed }) => [authScreenStyles.linkWrap, pressed ? authScreenStyles.linkPressed : null]}
                  >
                    <Text style={authScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Ir a iniciar sesión
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}
