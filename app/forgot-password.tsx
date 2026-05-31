import { Redirect, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { requestPasswordReset } from "../api/auth";
import { ApiError } from "../api/client";
import { AnimatedGoldButton } from "../components/auth/AnimatedGoldButton";
import { AuthTopGlow } from "../components/AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, authScreenStyles, collectFieldErrors } from "../constants/authUi";
import { forgotPasswordFormSchema } from "../constants/forgotPasswordSchema";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessages";

const RATE_LIMIT_COOLDOWN_MS = 60_000;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isHydrated, isAuthenticated } = useAuth();
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; detail?: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) {
        clearTimeout(rateLimitTimerRef.current);
        rateLimitTimerRef.current = null;
      }
    };
  }, []);

  const scheduleRateLimitCooldown = useCallback(() => {
    if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
    setRateLimited(true);
    rateLimitTimerRef.current = setTimeout(() => {
      setRateLimited(false);
      rateLimitTimerRef.current = null;
    }, RATE_LIMIT_COOLDOWN_MS);
  }, []);

  const onSubmit = useCallback(async () => {
    if (rateLimited) return;
    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);
    setDevResetToken(null);
    const parsed = forgotPasswordFormSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error.issues));
      return;
    }
    setSubmitting(true);
    try {
      const res = await requestPasswordReset(parsed.data.email.trim());
      setSuccessMessage(res.message);
      if (__DEV__ && res.devResetToken) {
        setDevResetToken(res.devResetToken);
      }
    } catch (e) {
      if (e instanceof ApiError && e.code === "AUTH_RATE_LIMITED") {
        setSubmitError({
          message:
            "Has hecho demasiados intentos. Espera unos 15 minutos antes de volver a intentarlo.",
        });
        scheduleRateLimitCooldown();
        return;
      }
      if (e instanceof ApiError) {
        setSubmitError({
          message: getErrorMessage(e, "No se pudo enviar la solicitud"),
          detail: __DEV__ ? `Código ${e.code} · HTTP ${e.status}` : undefined,
        });
      } else {
        setSubmitError({ message: "No se pudo enviar la solicitud." });
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, rateLimited, scheduleRateLimitCooldown]);

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
          title: "Recuperar contraseña",
          headerShown: true,
          headerStyle: { backgroundColor: AUTH.bg },
          headerShadowVisible: false,
          headerTintColor: AUTH.gold,
          headerTitleStyle: { color: AUTH.neutral100, fontWeight: "600", fontSize: 17 },
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/login")}
              hitSlop={10}
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
            >
              <Text style={authScreenStyles.headerLink} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Atrás
              </Text>
            </Pressable>
          ),
        }}
      />
      <View style={authScreenStyles.root}>
        <StatusBar style="light" />
        <AuthTopGlow width={width} windowHeight={height} />
        <SafeAreaView style={authScreenStyles.safe} edges={["top", "left", "right"]}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={authScreenStyles.flex}>
              <KeyboardAvoidingView
                style={authScreenStyles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? Math.max(insets.top, 20) + 48 : 0}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[
                    authScreenStyles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom, 16) + 28 },
                  ]}
                >
              <View style={authScreenStyles.card}>
                <View style={authScreenStyles.cardGlowLine} pointerEvents="none" />
                <Text style={authScreenStyles.cardTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Recuperar contraseña
                </Text>
                <Text style={authScreenStyles.cardSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Te enviaremos instrucciones si el correo está registrado.
                </Text>

                <View style={authScreenStyles.fieldBlock}>
                  <Text style={authScreenStyles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Email
                  </Text>
                  <TextInput
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      setSubmitError(null);
                      setSuccessMessage(null);
                      setDevResetToken(null);
                    }}
                    placeholder="tu@email.com"
                    placeholderTextColor={AUTH.faint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="go"
                    onSubmitEditing={() => void onSubmit()}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={[authScreenStyles.input, { borderColor: focused ? AUTH.fieldBorderFocus : AUTH.fieldBorder }]}
                    selectionColor={AUTH.gold}
                    cursorColor={AUTH.gold}
                    underlineColorAndroid="transparent"
                  />
                  {fieldErrors.email ? (
                    <Text style={authScreenStyles.fieldError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {fieldErrors.email}
                    </Text>
                  ) : null}
                </View>

                {submitError ? (
                  <View style={authScreenStyles.errorBox}>
                    <Text style={authScreenStyles.submitError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {submitError.message}
                    </Text>
                    {submitError.detail ? (
                      <Text
                        style={authScreenStyles.submitErrorDetail}
                        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                      >
                        {submitError.detail}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                {successMessage ? (
                  <View style={authScreenStyles.successBox}>
                    <Text style={authScreenStyles.successText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {successMessage}
                    </Text>
                    {devResetToken ? (
                      <View style={{ gap: 8 }}>
                        <Text style={authScreenStyles.monoHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                          Token dev: {devResetToken}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() =>
                            router.push({
                              pathname: "/reset-password",
                              params: { token: devResetToken },
                            })
                          }
                          style={({ pressed }) => [authScreenStyles.linkWrapTight, pressed ? authScreenStyles.linkPressed : null]}
                        >
                          <Text style={authScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                            Restablecer contraseña en la app
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <AnimatedGoldButton
                  label={rateLimited ? "Espera un momento…" : "Enviar instrucciones"}
                  loadingLabel="Enviando…"
                  loading={submitting}
                  disabled={rateLimited}
                  onPress={onSubmit}
                />

                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel="Volver al inicio de sesión"
                  onPress={() => router.replace("/login")}
                  style={({ pressed }) => [authScreenStyles.linkWrap, pressed ? authScreenStyles.linkPressed : null]}
                >
                  <Text style={authScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Volver a iniciar sesión
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
            </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </View>
    </>
  );
}
