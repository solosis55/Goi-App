import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getWorkouts } from "../../api/workouts";
import { WorkoutPerformScreen } from "../../components/workouts/WorkoutPerformScreen";
import { AUTH, APP_STACK_SCREEN_OPTIONS, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useGoiAlert } from "../../context/GoiAlertContext";
import type { Workout } from "../../types/workout";
import { getErrorMessage } from "../../utils/errorMessages";
import { clearActiveWorkoutSession, readActiveWorkoutSession } from "../../utils/workoutSessionPerform";

export default function EntrenarRutinaScreen() {
  const { workoutId: rawId } = useLocalSearchParams<{ workoutId: string }>();
  const workoutId = typeof rawId === "string" ? rawId.trim() : "";
  const router = useRouter();
  const { isHydrated, isAuthenticated, user } = useAuth();
  const { showAlert } = useGoiAlert();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!workoutId || !user?.id) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getWorkouts();
        if (cancelled) return;
        const found = list.find((w) => w.id === workoutId && w.userId === user.id) ?? null;
        if (!found) {
          setError("No se encontró esta rutina");
          setWorkout(null);
          return;
        }

        const active = await readActiveWorkoutSession();
        if (active && active.workoutId !== workoutId) {
          const switchWorkout = () => {
            void clearActiveWorkoutSession().then(() => {
              if (!cancelled) {
                setWorkout(found);
                setReady(true);
              }
            });
          };
          showAlert({
            title: "Entrenamiento en curso",
            message: `Ya estás entrenando «${active.workoutTitle}». Si continúas, se descartará ese progreso.`,
            buttons: [
              { text: "Cancelar", style: "cancel", onPress: () => router.back() },
              { text: "Empezar esta rutina", style: "destructive", onPress: switchWorkout },
            ],
          });
          return;
        }

        setWorkout(found);
        setReady(true);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "No se pudo cargar la rutina"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [workoutId, user?.id, router, showAlert]);

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

  if (loading || !ready) {
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
      <WorkoutPerformScreen workout={workout} />
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
