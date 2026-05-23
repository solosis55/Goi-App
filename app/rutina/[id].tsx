import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getWorkouts } from "../../api/workouts";
import { WorkoutEditorScreen } from "../../components/workouts/WorkoutEditorScreen";
import { AUTH, APP_STACK_SCREEN_OPTIONS, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import type { Workout } from "../../types/workout";
import { getErrorMessage } from "../../utils/errorMessages";

export default function EditarRutinaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workoutId = typeof id === "string" ? id.trim() : "";
  const router = useRouter();
  const { isHydrated, isAuthenticated, user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workoutId || !user?.id) return;
    let cancelled = false;
    setLoading(true);
    void getWorkouts()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((w) => w.id === workoutId && w.userId === user.id) ?? null;
        setWorkout(found);
        if (!found) setError("No se encontró esta rutina");
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e, "No se pudo cargar la rutina"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workoutId, user?.id]);

  if (!isHydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={AUTH.gold} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!workoutId) {
    return <Redirect href="/(tabs)/entrenamientos" />;
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={AUTH.gold} size="large" />
      </View>
    );
  }

  if (error || !workout) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {error ?? "Rutina no disponible"}
          </Text>
          <Pressable onPress={() => router.back()} style={styles.retry}>
            <Text style={styles.retryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Volver
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ ...APP_STACK_SCREEN_OPTIONS, presentation: "card" }} />
      <WorkoutEditorScreen mode="edit" workout={workout} />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: AUTH.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 15,
    textAlign: "center",
  },
  retry: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryText: {
    color: AUTH.gold,
    fontWeight: "600",
  },
});
