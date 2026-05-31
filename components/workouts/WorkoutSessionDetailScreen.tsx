import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import { useSessionDetailEnrichment } from "../../hooks/useSessionDetailEnrichment";
import type { WorkoutSessionDetail } from "../../types/workoutSession";
import {
  formatDurationLabel,
  parseSessionNotesSummary,
} from "../../utils/buildSessionSnapshot";
import { formatSessionPerformedAt } from "../../utils/formatSessionDate";
import { AppScreenShell } from "../AppScreenShell";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";
import { UserAvatar } from "../ui/UserAvatar";
import { SessionDetailEmptyState } from "./session/SessionDetailEmptyState";
import { SessionDetailExerciseCard } from "./session/SessionDetailExerciseCard";
import { SessionDetailHeroFade } from "./session/SessionDetailHeroFade";
import {
  SessionDetailTimelineItem,
  SessionDetailTimelineList,
} from "./session/SessionDetailTimelineList";
import { sessionDetailStyles as s } from "./session/sessionDetailStyles";

type WorkoutSessionDetailScreenProps = {
  session: WorkoutSessionDetail | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  /** Post Training vinculado (desde feed o perfil). */
  linkedPostId?: string | null;
};

function StatPill({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={[workoutScreenStyles.statPill, styles.statPillFlex]}>
      <Text
        style={accent ? workoutScreenStyles.statPillValueAccent : workoutScreenStyles.statPillValue}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {value}
      </Text>
      <Text style={workoutScreenStyles.statPillLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

export function WorkoutSessionDetailScreen({
  session,
  loading,
  error,
  onRetry,
  linkedPostId,
}: WorkoutSessionDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const enrichment = useSessionDetailEnrichment(session);

  const parsedNotes = useMemo(
    () => (session ? parseSessionNotesSummary(session.notes) : { setsLabel: null, bodyNotes: "" }),
    [session]
  );

  const snapshot = session?.snapshot;
  const durationLabel = snapshot ? formatDurationLabel(snapshot.durationSec) : null;
  const sessionComment = parsedNotes.bodyNotes.trim();
  const hasBlocks = (snapshot?.blocks.length ?? 0) > 0;
  const postId = linkedPostId?.trim() || null;

  return (
    <AppScreenShell>
      <View style={[s.screenHeader, styles.headerPad, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Volver">
          <Text style={s.backLink} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            ← Volver
          </Text>
        </Pressable>
        <Text style={s.screenTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Entreno completo
        </Text>
        <View style={s.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={AUTH.gold} size="large" />
        </View>
      ) : error || !session ? (
        <View style={styles.centered}>
          <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {error ?? "Sesión no disponible"}
          </Text>
          {onRetry ? (
            <Pressable onPress={onRetry} style={workoutScreenStyles.ghostBtn}>
              <Text style={workoutScreenStyles.ghostBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Reintentar
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            styles.scrollPad,
            { paddingBottom: insets.bottom + 28 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.heroCard}>
            <View style={workoutScreenStyles.cardGlowLine} />
            <Text style={s.heroKicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Sesión completada
            </Text>
            <View style={s.authorRow}>
              <UserAvatar src={session.authorAvatarUrl} username={session.authorUsername} size={40} />
              <View style={styles.authorMeta}>
                <Text style={s.authorName} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  @{session.authorUsername}
                </Text>
                <Text style={s.performedAt} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {formatSessionPerformedAt(session.performedAt)}
                </Text>
              </View>
            </View>
            <View style={s.titleRow}>
              <View style={s.titleIconRing}>
                <TabDumbbellIcon size={24} color={AUTH.gold} filled />
              </View>
              <Text style={s.workoutTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {session.workoutTitle}
              </Text>
            </View>
            {durationLabel ? (
              <View style={s.durationRow}>
                <Text style={s.durationLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Tiempo de sesión
                </Text>
                <Text style={s.durationValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {durationLabel}
                </Text>
              </View>
            ) : null}
            {sessionComment ? (
              <View style={s.quoteBox}>
                <Text style={s.quoteLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Comentario de la sesión
                </Text>
                <Text style={s.quoteBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {sessionComment}
                </Text>
              </View>
            ) : null}
            {postId ? (
              <Pressable
                onPress={() => router.push({ pathname: "/publicacion/[id]", params: { id: postId } })}
                style={({ pressed }) => [s.postLinkBtn, pressed ? { opacity: 0.88 } : null]}
                accessibilityRole="button"
                accessibilityLabel="Ver publicación en el feed"
              >
                <Text style={s.postLinkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Ver publicación ›
                </Text>
              </Pressable>
            ) : null}
          </View>

          <SessionDetailHeroFade />

          <View style={s.statsRow}>
            {snapshot ? (
              <>
                <StatPill value={`${snapshot.completedSets}/${snapshot.totalSets}`} label="Series" />
                <StatPill
                  value={`${snapshot.completedExercises}/${snapshot.totalExercises}`}
                  label="Ejercicios"
                />
                {snapshot.volumeKg != null && snapshot.volumeKg > 0 ? (
                  <StatPill value={`${snapshot.volumeKg}`} label="kg volumen" accent />
                ) : null}
              </>
            ) : parsedNotes.setsLabel ? (
              <StatPill value={parsedNotes.setsLabel} label="Series" accent />
            ) : (
              <StatPill value="—" label="Resumen" />
            )}
          </View>

          {hasBlocks ? (
            <View>
              <View style={s.sectionHead}>
                <Text style={s.sectionKicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Registro
                </Text>
                <Text style={s.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Ejercicios
                </Text>
              </View>
              <SessionDetailTimelineList>
                {snapshot!.blocks.map((block, i, arr) => (
                  <SessionDetailTimelineItem key={block.exerciseId + block.exerciseName} isLast={i === arr.length - 1}>
                    <SessionDetailExerciseCard
                      block={block}
                      imageUri={enrichment.imageByExerciseId[block.exerciseId]}
                      meta={enrichment.metaByExerciseId[block.exerciseId]}
                      lastPerformance={enrichment.lastPerformanceByExerciseId[block.exerciseId]}
                    />
                  </SessionDetailTimelineItem>
                ))}
              </SessionDetailTimelineList>
            </View>
          ) : (
            <SessionDetailEmptyState
              notesPreview={sessionComment || session.notes.trim() || parsedNotes.bodyNotes}
            />
          )}
        </ScrollView>
      )}
    </AppScreenShell>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: AUTH_PAD,
    marginBottom: 8,
  },
  scrollPad: {
    paddingHorizontal: AUTH_PAD,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: AUTH_PAD,
    gap: 12,
  },
  errorText: { color: AUTH.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
  authorMeta: { flex: 1, gap: 2 },
  statPillFlex: {
    flex: 1,
    minWidth: "30%",
  },
});
