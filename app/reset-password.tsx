import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
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
import { resetPasswordWithToken } from "../api/auth";
import { ApiError } from "../api/client";
import { AnimatedGoldButton } from "../components/auth/AnimatedGoldButton";
import { AuthTopGlow } from "../components/AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, authScreenStyles, collectFieldErrors } from "../constants/authUi";
import { resetPasswordFormSchema } from "../constants/resetPasswordSchema";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessages";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const token = typeof tokenParam === "string" ? tokenParam.trim() : "";
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isHydrated, isAuthenticated } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; detail?: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"password" | "confirm" | null>(null);

  const onSubmit = useCallback(async () => {
    if (!token) return;
    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);
    const parsed = resetPasswordFormSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error.issues));
      return;
    }
    setSubmitting(true);
    try {
      const res = await resetPasswordWithToken({ token, password: parsed.data.password });
      setSuccessMessage(res.message);
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitError({
          message: getErrorMessage(e, "No se pudo restablecer la contraseña"),
          detail: __DEV__ ? `Código ${e.code} · HTTP ${e.status}` : undefined,
        });
      } else {
        setSubmitError({ message: "No se pudo restablecer la contraseña." });
      }
    } finally {
      setSubmitting(false);
    }
  }, [token, password, confirmPassword]);

  const inputBorder = (key: "password" | "confirm") =>
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

  if (!token) {
    return <Redirect href="/forgot-password" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nueva contraseña",
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
                      Nueva contraseña
                    </Text>
                    <Text style={authScreenStyles.cardSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Elige una contraseña segura de al menos 6 caracteres.
                    </Text>

                    <View style={authScreenStyles.fieldBlock}>
                      <View style={authScreenStyles.passwordLabelRow}>
                        <Text style={[authScreenStyles.label, { marginBottom: 0 }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                          Contraseña
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          hitSlop={8}
                          onPress={() => setShowPassword((v) => !v)}
                          style={({ pressed }) => [authScreenStyles.passwordToggleHit, pressed ? authScreenStyles.linkPressed : null]}
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
                          setSuccessMessage(null);
                        }}
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor={AUTH.faint}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField((f) => (f === "password" ? null : f))}
                        style={[authScreenStyles.input, { borderColor: inputBorder("password") }]}
                        selectionColor={AUTH.gold}
                        cursorColor={AUTH.gold}
                        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                      />
                      {fieldErrors.password ? (
                        <Text style={authScreenStyles.fieldError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                          {fieldErrors.password}
                        </Text>
                      ) : null}
                    </View>

                    <View style={authScreenStyles.fieldBlock}>
                      <Text style={authScreenStyles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        Confirmar contraseña
                      </Text>
                      <TextInput
                        value={confirmPassword}
                        onChangeText={(t) => {
                          setConfirmPassword(t);
                          setSubmitError(null);
                          setSuccessMessage(null);
                        }}
                        placeholder="Repite la contraseña"
                        placeholderTextColor={AUTH.faint}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        returnKeyType="go"
                        onSubmitEditing={() => void onSubmit()}
                        onFocus={() => setFocusedField("confirm")}
                        onBlur={() => setFocusedField((f) => (f === "confirm" ? null : f))}
                        style={[authScreenStyles.input, { borderColor: inputBorder("confirm") }]}
                        selectionColor={AUTH.gold}
                        cursorColor={AUTH.gold}
                        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                      />
                      {fieldErrors.confirmPassword ? (
                        <Text style={authScreenStyles.fieldError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                          {fieldErrors.confirmPassword}
                        </Text>
                      ) : null}
                    </View>

                    {submitError ? (
                      <View style={authScreenStyles.errorBox}>
                        <Text style={authScreenStyles.submitError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                          {submitError.message}
                        </Text>
                        {submitError.detail ? (
                          <Text style={authScreenStyles.submitErrorDetail} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
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
                      </View>
                    ) : null}

                    {successMessage ? (
                      <AnimatedGoldButton
                        label="Ir a iniciar sesión"
                        loadingLabel="Ir a iniciar sesión"
                        loading={false}
                        onPress={() => router.replace("/login")}
                      />
                    ) : (
                      <AnimatedGoldButton
                        label="Guardar contraseña"
                        loadingLabel="Guardando…"
                        loading={submitting}
                        onPress={onSubmit}
                      />
                    )}
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
