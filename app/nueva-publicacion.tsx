import {
  Box,
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Redirect, Stack, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import {
  buildPostContentForApi,
  publicacionSchema,
  validatePostBodyLength,
  type PublicacionForm,
} from "../constants/publicacionSchema";
import { useGoiTheme } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../api/posts";
import { ApiError } from "../api/client";

const SCREEN_PADDING = 16;

type TipoPublicacion = PublicacionForm["tipo"];

const IDEA_COLORS = ["#2563EB", "#16A34A", "#CA8A04", "#DC2626", "#9333EA"] as const;

function collectFieldErrors(
  issues: ReadonlyArray<{ readonly path: readonly PropertyKey[]; message: string }>
) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "_root");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function HeaderInicioLink() {
  const router = useRouter();
  const { palette, typography } = useGoiTheme();
  return (
    <Pressable
      onPress={() => router.replace("/feed")}
      style={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      <Text style={{ color: palette.primary, fontSize: typography.fontSize.md }}>Inicio</Text>
    </Pressable>
  );
}

export default function NuevaPublicacionScreen() {
  const router = useRouter();
  const { palette, typography, spacing } = useGoiTheme();
  const { isHydrated, isAuthenticated } = useAuth();
  const [tipo, setTipo] = useState<TipoPublicacion>("texto");
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [items, setItems] = useState<string[]>([""]);
  const [color, setColor] = useState<string>(IDEA_COLORS[0]);
  const [tags, setTags] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  /** Errores de red/API visibles en pantalla (Alert en web es poco fiable). */
  const [submitError, setSubmitError] = useState<string | null>(null);

  const keyboardBehavior = useMemo(
    () => (Platform.OS === "ios" ? "padding" : "height"),
    []
  );

  const resetErrors = useCallback(() => {
    setFieldErrors({});
    setSubmitError(null);
  }, []);

  const onChangeTipo = useCallback(
    (next: TipoPublicacion) => {
      setTipo(next);
      resetErrors();
    },
    [resetErrors]
  );

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, ""]);
    resetErrors();
  }, [resetErrors]);

  const removeItem = useCallback(
    (index: number) => {
      setItems((prev) => prev.filter((_, i) => i !== index));
      resetErrors();
    },
    [resetErrors]
  );

  const updateItem = useCallback(
    (index: number, value: string) => {
      setItems((prev) => prev.map((s, i) => (i === index ? value : s)));
      resetErrors();
    },
    [resetErrors]
  );

  const onSubmit = useCallback(async () => {
    setSubmitError(null);
    const payload: PublicacionForm =
      tipo === "texto"
        ? { tipo: "texto", titulo, contenido }
        : tipo === "lista"
          ? { tipo: "lista", titulo, items }
          : { tipo: "idea", titulo, color, tags };

    const parsed = publicacionSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(collectFieldErrors(parsed.error.issues));
      return;
    }

    const content = buildPostContentForApi(parsed.data);
    const lengthError = validatePostBodyLength(content);
    if (lengthError) {
      setFieldErrors({ _root: lengthError });
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await createPost({
        content,
        workoutId: null,
        visibility: "public",
      });
      router.replace("/feed");
      if (Platform.OS !== "web") {
        Alert.alert("Goi", "Publicación creada.");
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo publicar.";
      setSubmitError(msg);
      if (Platform.OS !== "web") {
        Alert.alert("Goi", msg);
      }
    } finally {
      setSubmitting(false);
    }
  }, [tipo, titulo, contenido, items, color, tags, router]);

  const labelStyle = {
    color: palette.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  } as const;

  const errorStyle = {
    color: palette.danger,
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  } as const;

  if (!isHydrated) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" style={{ backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.primary} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nueva publicación",
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
          headerRight: () => <HeaderInicioLink />,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: palette.background }}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: SCREEN_PADDING, paddingBottom: 32 }}
        >
          <VStack space="lg">
            <Text style={{ color: palette.textMuted, fontSize: typography.fontSize.sm }}>
              Tipo de contenido (equivalente al enunciado: nota / checklist / idea).
            </Text>

            <HStack space="sm" flexWrap="wrap">
              {(
                [
                  ["texto", "Texto"],
                  ["lista", "Lista"],
                  ["idea", "Idea"],
                ] as const
              ).map(([value, label]) => {
                const selected = tipo === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => onChangeTipo(value)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: selected ? palette.primary : palette.surfaceMuted,
                      borderWidth: 1,
                      borderColor: selected ? palette.primary : palette.border,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? palette.primaryForeground : palette.text,
                        fontWeight: typography.fontWeight.medium,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>

            <VStack space="xs">
              <Text style={labelStyle}>Título</Text>
              <Input variant="outline" size="md">
                <InputField
                  value={titulo}
                  onChangeText={(t) => {
                    setTitulo(t);
                    resetErrors();
                  }}
                  placeholder="Mínimo 3 caracteres"
                  placeholderTextColor={palette.textMuted}
                  style={{ color: palette.text }}
                />
              </Input>
              {fieldErrors.titulo ? (
                <Text style={errorStyle}>{fieldErrors.titulo}</Text>
              ) : null}
            </VStack>

            {tipo === "texto" ? (
              <VStack space="xs">
                <Text style={labelStyle}>Contenido</Text>
                <Input variant="outline" size="md">
                  <InputField
                    value={contenido}
                    onChangeText={(t) => {
                      setContenido(t);
                      resetErrors();
                    }}
                    placeholder="Escribe el cuerpo de la publicación"
                    placeholderTextColor={palette.textMuted}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    style={{ color: palette.text, minHeight: 120 }}
                  />
                </Input>
                {fieldErrors.contenido ? (
                  <Text style={errorStyle}>{fieldErrors.contenido}</Text>
                ) : null}
              </VStack>
            ) : null}

            {tipo === "lista" ? (
              <VStack space="md">
                <Text style={labelStyle}>Ítems de la lista</Text>
                {items.map((item, index) => (
                  <HStack key={index} space="sm" alignItems="center">
                    <Box flex={1}>
                      <Input variant="outline" size="md">
                        <InputField
                          value={item}
                          onChangeText={(t) => updateItem(index, t)}
                          placeholder={`Ítem ${index + 1}`}
                          placeholderTextColor={palette.textMuted}
                          style={{ color: palette.text }}
                        />
                      </Input>
                    </Box>
                    {items.length > 1 ? (
                      <Pressable onPress={() => removeItem(index)} hitSlop={8}>
                        <Text style={{ color: palette.danger, fontSize: typography.fontSize.sm }}>
                          Quitar
                        </Text>
                      </Pressable>
                    ) : null}
                  </HStack>
                ))}
                {fieldErrors.items ? (
                  <Text style={errorStyle}>{fieldErrors.items}</Text>
                ) : null}
                <Button variant="outline" size="sm" onPress={addItem} alignSelf="flex-start">
                  <ButtonText>Añadir ítem</ButtonText>
                </Button>
              </VStack>
            ) : null}

            {tipo === "idea" ? (
              <VStack space="lg">
                <VStack space="xs">
                  <Text style={labelStyle}>Color</Text>
                  <HStack space="sm" flexWrap="wrap">
                    {IDEA_COLORS.map((c) => {
                      const selected = color === c;
                      return (
                        <Pressable
                          key={c}
                          onPress={() => {
                            setColor(c);
                            resetErrors();
                          }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: c,
                            borderWidth: selected ? 3 : 0,
                            borderColor: palette.text,
                          }}
                        />
                      );
                    })}
                  </HStack>
                  {fieldErrors.color ? (
                    <Text style={errorStyle}>{fieldErrors.color}</Text>
                  ) : null}
                </VStack>
                <VStack space="xs">
                  <Text style={labelStyle}>Etiquetas</Text>
                  <Input variant="outline" size="md">
                    <InputField
                      value={tags}
                      onChangeText={(t) => {
                        setTags(t);
                        resetErrors();
                      }}
                      placeholder="ej. gimnasio, rutina, pierna"
                      placeholderTextColor={palette.textMuted}
                      style={{ color: palette.text }}
                    />
                  </Input>
                  {fieldErrors.tags ? (
                    <Text style={errorStyle}>{fieldErrors.tags}</Text>
                  ) : null}
                </VStack>
              </VStack>
            ) : null}

            {fieldErrors._root ? (
              <Text style={errorStyle} marginTop="$2">
                {fieldErrors._root}
              </Text>
            ) : null}

            {submitError ? (
              <Text style={errorStyle} marginTop="$2">
                {submitError}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void onSubmit();
              }}
              disabled={submitting}
              style={({ pressed }) => ({
                marginTop: spacing.sm,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: palette.primary,
                opacity: submitting ? 0.65 : pressed ? 0.88 : 1,
              })}
            >
              <Text
                style={{
                  color: palette.primaryForeground,
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {submitting ? "Publicando…" : "Publicar"}
              </Text>
            </Pressable>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
