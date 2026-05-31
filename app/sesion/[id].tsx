import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getWorkoutSession } from "../../api/workoutSessions";
import { WorkoutSessionDetailScreen } from "../../components/workouts/WorkoutSessionDetailScreen";
import { AUTH, APP_CARD_STACK_OPTIONS } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import type { WorkoutSessionDetail } from "../../types/workoutSession";
import { getErrorMessage } from "../../utils/errorMessages";

export default function SesionDetailRoute() {
  const { id, postId } = useLocalSearchParams<{ id: string; postId?: string }>();
  const sessionId = typeof id === "string" ? id.trim() : "";
  const linkedPostId = typeof postId === "string" ? postId.trim() : "";
  const { isHydrated, isAuthenticated } = useAuth();
  const [session, setSession] = useState<WorkoutSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await getWorkoutSession(sessionId);
      setSession(detail);
    } catch (e) {
      setSession(null);
      setError(getErrorMessage(e, "No se pudo cargar la sesión"));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: AUTH.bg }}>
        <ActivityIndicator color={AUTH.gold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!sessionId) {
    return <Redirect href="/(tabs)/entrenamientos" />;
  }

  return (
    <>
      <Stack.Screen options={{ ...APP_CARD_STACK_OPTIONS, headerShown: false }} />
      <WorkoutSessionDetailScreen
        session={session}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        linkedPostId={linkedPostId || null}
      />
    </>
  );
}
