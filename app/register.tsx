import * as Haptics from "expo-haptics";
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
import { login, register } from "../api/auth";
import { ApiError } from "../api/client";
import { AnimatedGoldButton } from "../components/auth/AnimatedGoldButton";
import { AuthTopGlow } from "../components/AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, authScreenStyles, collectFieldErrors } from "../constants/authUi";
import { registerFormSchema } from "../constants/registerSchema";
import { useAuth } from "../context/AuthContext";
import { useGoiAlert } from "../context/GoiAlertContext";
import { getErrorMessage } from "../utils/errorMessages";
import { offerBiometricUnlockAfterLogin } from "../utils/offerBiometricUnlock";

const RATE_LIMIT_COOLDOWN_MS = 60_000;

export default function RegisterScreen() {
  const { showAlert } = useGoiAlert();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isHydrated, isAuthenticated, signIn, notifyBiometricUnlockOptIn } = useAuth();
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; detail?: string } | null>(null);
  const [focusedField, setFocusedField] = useState<"username" | "email" | "password" | null>(null);
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
    const parsed = registerFormSchema.safeParse({ username, email, password });
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error.issues));
      return;
    }
    setSubmitting(true);
    try {
      const body = parsed.data;
      const reg = await register(body);
      if (reg.token && reg.user) {
        await signIn(reg.token, reg.user);
      } else {
        const loginRes = await login({ email: body.email, password: body.password });
        if (!loginRes.token) {
          setSubmitError({
            message: "Cuenta creada pero el servidor no devolvió sesión. Inicia sesión manualmente.",
            detail: __DEV__ ? "Respuesta de login sin `token`" : undefined,
          });
          return;
        }
        await signIn(loginRes.token, loginRes.user);
      }
      if (Platform.OS !== "web") {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* sin módulo nativo */
        }
      }
      offerBiometricUnlockAfterLogin(router, notifyBiometricUnlockOptIn, showAlert);
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
          message: getErrorMessage(e, "No se pudo crear la cuenta."),
          detail: __DEV__ ? `Código ${e.code} · HTTP ${e.status}` : undefined,
        });
      } else {
        setSubmitError({ message: "No se pudo crear la cuenta." });
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, password, notifyBiometricUnlockOptIn, rateLimited, router, scheduleRateLimitCooldown, signIn, username]);

  const border = (key: "username" | "email" | "password") =>
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
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Crear cuenta",
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
                  Crear cuenta
                </Text>
                <Text style={authScreenStyles.cardSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Únete con un usuario, email y contraseña.
                </Text>

                <View style={authScreenStyles.fieldBlock}>
                  <Text style={authScreenStyles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Usuario
                  </Text>
                  <TextInput
                    ref={usernameRef}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                    value={username}
                    onChangeText={(t) => {
                      setUsername(t);
                      setSubmitError(null);
                    }}
                    placeholder="tu_usuario"
                    placeholderTextColor={AUTH.faint}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="username"
                    textContentType="username"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => emailRef.current?.focus()}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField((f) => (f === "username" ? null : f))}
                    style={[authScreenStyles.input, { borderColor: border("username") }]}
                    selectionColor={AUTH.gold}
                    cursorColor={AUTH.gold}
                    underlineColorAndroid="transparent"
                  />
                  {fieldErrors.username ? (
                    <Text style={authScreenStyles.fieldError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {fieldErrors.username}
                    </Text>
                  ) : null}
                </View>

                <View style={authScreenStyles.fieldBlock}>
                  <Text style={authScreenStyles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Email
                  </Text>
                  <TextInput
                    ref={emailRef}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
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
                    style={[authScreenStyles.input, { borderColor: border("email") }]}
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

                <View style={authScreenStyles.fieldBlock}>
                  <View style={authScreenStyles.passwordLabelRow}>
                    <Text
                      style={[authScreenStyles.label, { marginBottom: 0 }]}
                      maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                    >
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
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      setSubmitError(null);
                    }}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={AUTH.faint}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                    textContentType="newPassword"
                    returnKeyType="go"
                    onSubmitEditing={() => void onSubmit()}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField((f) => (f === "password" ? null : f))}
                    style={[authScreenStyles.input, { borderColor: border("password") }]}
                    selectionColor={AUTH.gold}
                    cursorColor={AUTH.gold}
                    underlineColorAndroid="transparent"
                  />
                  {fieldErrors.password ? (
                    <Text style={authScreenStyles.fieldError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      {fieldErrors.password}
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

                <AnimatedGoldButton
                  label={rateLimited ? "Espera un momento…" : "Crear cuenta"}
                  loadingLabel="Procesando…"
                  loading={submitting}
                  disabled={rateLimited}
                  onPress={onSubmit}
                />

                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel="Ir a iniciar sesión"
                  onPress={() => router.replace("/login")}
                  style={({ pressed }) => [authScreenStyles.linkWrap, pressed ? authScreenStyles.linkPressed : null]}
                >
                  <Text style={authScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    ¿Ya tienes cuenta? Inicia sesión
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
