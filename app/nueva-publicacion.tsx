import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { CreatePostFormatChooser } from "../components/post/CreatePostFormatChooser";
import { CreatePostScreen } from "../components/post/CreatePostScreen";
import { parsePostFormat, type PostFormat } from "../constants/postFormat";
import { useAuth } from "../context/AuthContext";

function resolveInitialFormat(
  formatParam: string | undefined,
  sessionId: string | null
): PostFormat | null {
  if (formatParam === "standard" || formatParam === "training") {
    return formatParam;
  }
  if (sessionId) return "training";
  return null;
}

export default function NuevaPublicacionScreen() {
  const { isHydrated, isAuthenticated } = useAuth();
  const {
    sessionId: sessionIdParam,
    workoutId: workoutIdParam,
    format: formatParam,
    source: sourceParam,
  } = useLocalSearchParams<{
    sessionId?: string;
    workoutId?: string;
    format?: string;
    source?: string;
  }>();

  const initialSessionId =
    typeof sessionIdParam === "string" && sessionIdParam.trim() ? sessionIdParam.trim() : null;
  const fromWorkoutFinish = sourceParam === "workout-finish";
  const legacyWorkoutId =
    !initialSessionId && typeof workoutIdParam === "string" && workoutIdParam.trim()
      ? workoutIdParam.trim()
      : null;

  const initialFormat = useMemo(
    () => resolveInitialFormat(formatParam, initialSessionId),
    [formatParam, initialSessionId]
  );

  const [format, setFormat] = useState<PostFormat | null>(initialFormat);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator color="#d4af37" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "fullScreenModal", animation: "fade" }} />
      {format == null ? (
        <CreatePostFormatChooser
          onSelect={setFormat}
          suggestedFormat={initialSessionId ? "training" : undefined}
          hasLinkedSession={!!initialSessionId}
          sessionPreview={
            initialSessionId ? { workoutTitle: "tu sesión", performedAt: new Date().toISOString() } : null
          }
        />
      ) : (
        <CreatePostScreen
          format={parsePostFormat(format)}
          initialSessionId={initialSessionId}
          legacyWorkoutId={legacyWorkoutId}
          fromWorkoutFinish={fromWorkoutFinish}
          onChangeFormat={setFormat}
        />
      )}
    </>
  );
}
