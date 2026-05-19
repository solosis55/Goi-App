import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
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
import { login } from "../api/auth";
import { ApiError } from "../api/client";
import { AnimatedGoldButton } from "../components/auth/AnimatedGoldButton";
import { AuthTopGlow } from "../components/AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, authScreenStyles, collectFieldErrors } from "../constants/authUi";
import { loginFormSchema } from "../constants/loginSchema";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessages";
import { loadLastLoginEmail, saveLastLoginEmail } from "../utils/lastLoginEmail";
import { offerBiometricUnlockAfterLogin } from "../utils/offerBiometricUnlock";

const RATE_LIMIT_COOLDOWN_MS = 60_000;

const APP_VERSION_LABEL =
  Constants.nativeAppVersion ?? Constants.expoConfig?.version ?? "—";

function hapticLoginErrorLight() {
  if (Platform.OS === "web") return;
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* sin módulo nativo */
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isHydrated, isAuthenticated, signIn, notifyBiometricUnlockOptIn } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message: string;
    detail?: string;
    hint?: string;
  } | null>(null);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    if (!isHydrated || isAuthenticated) return;
    void loadLastLoginEmail().then((saved) => {
      if (saved) setEmail(saved);
    });
  }, [isHydrated, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) {
        clearTimeout(rateLimitTimerRef.current);
        rateLimitTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    router.replace("/feed");
  }, [isHydrated, isAuthenticated, router]);

  const scheduleRateLimitCooldown = useCallback(() => {
    if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
    setRateLimited(true);
    rateLimitTimerRef.current = setTimeout(() => {
      setRateLimited(false);
      rateLimitTimerRef.current = null;
    }, RATE_LIMIT_COOLDOWN_MS);
  }, []);

  const onSubmit = useCallback(async () => {
    if (submitting || rateLimited) return;
    setFieldErrors({});
    setSubmitError(null);
    const parsed = loginFormSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error.issues));
      return;
    }
    setSubmitting(true);
    try {
      const res = await login(parsed.data);
      if (!res.token) {
        hapticLoginErrorLight();
        setSubmitError({
          message: "El servidor no devolvió token. Revisa la API.",
          detail: __DEV__ ? "Respuesta sin `token`" : undefined,
          hint:
            "Comprueba la conexión y que el servidor Goi Web esté en marcha (URL en EXPO_PUBLIC_API_URL).",
        });
        return;
      }
      await signIn(res.token, res.user);
      await saveLastLoginEmail(parsed.data.email);
      if (Platform.OS !== "web") {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* sin módulo nativo */
        }
      }
      offerBiometricUnlockAfterLogin(router, notifyBiometricUnlockOptIn);
    } catch (e) {
      hapticLoginErrorLight();
      if (e instanceof ApiError && e.code === "AUTH_RATE_LIMITED") {
        setSubmitError({
          message:
            "Has hecho demasiados intentos. Espera unos 15 minutos antes de volver a intentarlo.",
        });
        scheduleRateLimitCooldown();
        return;
      }
      if (e instanceof ApiError) {
        const networkish = e.code === "API_NETWORK_ERROR" || e.status === 0;
        setSubmitError({
          message: getErrorMessage(e, "No se pudo autenticar"),
          detail: __DEV__ ? `Código ${e.code} · HTTP ${e.status}` : undefined,
          hint: networkish
            ? "Comprueba la conexión Wi‑Fi o datos móviles, y que el servidor Goi Web esté en marcha."
            : undefined,
        });
      } else {
        setSubmitError({ message: "No se pudo autenticar." });
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, password, notifyBiometricUnlockOptIn, rateLimited, router, scheduleRateLimitCooldown, signIn, submitting]);

  const inputBorder = (key: "email" | "password") =>
    focusedField === key ? AUTH.fieldBorderFocus : AUTH.fieldBorder;

  if (!isHydrated) {
    return (
      <View style={[authScreenStyles.root, authScreenStyles.center]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={AUTH.gold} />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <View style={[authScreenStyles.root, authScreenStyles.center]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={AUTH.gold} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Iniciar sesión",
          headerShown: true,
          headerStyle: { backgroundColor: AUTH.bg },
          headerShadowVisible: false,
          headerTintColor: AUTH.gold,
          headerTitleStyle: { color: AUTH.neutral100, fontWeight: "600", fontSize: 17 },
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace("/")}
              hitSlop={10}
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
            >
              <Text style={authScreenStyles.headerLink} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Inicio
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
                  Iniciar sesión
                </Text>
                <Text style={authScreenStyles.cardSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Introduce tus credenciales para continuar.
                </Text>

                <View style={authScreenStyles.fieldBlock}>
                  <Text style={authScreenStyles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Email
                  </Text>
                  <TextInput
                    ref={emailRef}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      setSubmitError(null);
                    }}
                    placeholder="tu@email.com"
                    placeholderTextColor={AUTH.faint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField((f) => (f === "email" ? null : f))}
                    style={[authScreenStyles.input, { borderColor: inputBorder("email") }]}
                    selectionColor={AUTH.gold}
                    cursorColor={AUTH.gold}
                    underlineColorAndroid="transparent"
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  />
                  {fieldErrors.email ? (
                    <Text style={authScreenStyles.fieldError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {fieldErrors.email}
                    </Text>
                  ) : null}
                </View>

                <View style={authScreenStyles.fieldBlock}>
                  <View style={authScreenStyles.passwordLabelRow}>
                    <Text style={[authScreenStyles.label, { marginBottom: 0 }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Contraseña
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      hitSlop={8}
                      onPress={() => setShowPassword((v) => !v)}
                      style={({ pressed }) => [
                        authScreenStyles.passwordToggleHit,
                        pressed ? authScreenStyles.linkPressed : null,
                      ]}
                    >
                      <Text style={authScreenStyles.linkTextMuted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        {showPassword ? "Ocultar" : "Mostrar"}
                      </Text>
                    </Pressable>
                  </View>
                  <TextInput
                    ref={passwordRef}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      setSubmitError(null);
                    }}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={AUTH.faint}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={() => void onSubmit()}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField((f) => (f === "password" ? null : f))}
                    style={[authScreenStyles.input, { borderColor: inputBorder("password") }]}
                    selectionColor={AUTH.gold}
                    cursorColor={AUTH.gold}
                    underlineColorAndroid="transparent"
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  />
                  {fieldErrors.password ? (
                    <Text style={authScreenStyles.fieldError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {fieldErrors.password}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel="Recuperar contraseña"
                  onPress={() => router.push("/forgot-password")}
                  style={({ pressed }) => [
                    authScreenStyles.linkWrapTight,
                    pressed ? authScreenStyles.linkPressed : null,
                  ]}
                >
                  <Text style={authScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </Pressable>

                {submitError ? (
                  <View style={authScreenStyles.errorBox}>
                    <Text style={authScreenStyles.submitError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {submitError.message}
                    </Text>
                    {submitError.hint ? (
                      <Text style={authScreenStyles.submitErrorDetail} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        {submitError.hint}
                      </Text>
                    ) : null}
                    {submitError.detail ? (
                      <Text style={authScreenStyles.submitErrorDetail} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        {submitError.detail}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <AnimatedGoldButton
                  label={rateLimited ? "Espera un momento…" : "Entrar"}
                  loadingLabel="Procesando…"
                  loading={submitting}
                  disabled={rateLimited}
                  onPress={onSubmit}
                />

                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel="Crear cuenta"
                  onPress={() => router.push("/register")}
                  style={({ pressed }) => [authScreenStyles.linkWrap, pressed ? authScreenStyles.linkPressed : null]}
                >
                  <Text style={authScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    ¿No tienes cuenta? Crear cuenta
                  </Text>
                </Pressable>
                <Text
                  style={{
                    marginTop: 16,
                    textAlign: "center",
                    color: AUTH.faint,
                    fontSize: 11,
                  }}
                  maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                >
                  Versión {APP_VERSION_LABEL}
                </Text>
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
