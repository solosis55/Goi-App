import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";
import { formatSessionPerformedAt } from "../../utils/formatSessionDate";
import { parseSessionNotesSummary } from "../../utils/buildSessionSnapshot";
import type { SessionExercisePreview } from "../../utils/sessionExercisePreview";
import { POST_PREVIEW_CARD } from "./preview/postPreviewTheme";

export type PostSessionAttachmentMetrics = {
  completedSets?: number | null;
  totalSets?: number | null;
  completedExercises?: number | null;
  totalExercises?: number | null;
};

type PostSessionAttachmentProps = {
  workoutTitle?: string | null;
  performedAt?: string | null;
  sessionNotes?: string | null;
  metrics?: PostSessionAttachmentMetrics | null;
  /** Sin sesión vinculada (editor). */
  empty?: boolean;
  onPress?: () => void;
  onPressLink?: () => void;
  compact?: boolean;
  /** Sesión vinculada en el editor (resalte visual). */
  linked?: boolean;
  /** Muestra «Ver entreno completo» aunque no haya onPress (p. ej. mini-preview). */
  showViewFullCta?: boolean;
  exercisePreviews?: SessionExercisePreview[];
  moreExercisesCount?: number;
};

const PREVIEW_MAX_EXERCISES_DEFAULT = 3;
const PREVIEW_MAX_EXERCISES_COMPACT = 2;

function parseSetsRatioFromLabel(label: string | null | undefined): {
  completed: number;
  total: number;
} | null {
  if (!label?.trim()) return null;
  const match = label.trim().match(/^(\d+)\/(\d+)/);
  if (!match) return null;
  const total = Number(match[2]);
  if (!Number.isFinite(total) || total <= 0) return null;
  return { completed: Number(match[1]), total };
}

function SessionProgressBar({
  completed,
  total,
  compact,
}: {
  completed: number;
  total: number;
  compact: boolean;
}) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0;
  const pct = Math.round(ratio * 100);
  return (
    <View style={[styles.progressBlock, compact ? styles.progressBlockCompact : null]}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.progressLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {completed}/{total} series
      </Text>
    </View>
  );
}

function SessionExercisePreviewList({
  items,
  moreCount,
  compact,
  hero,
}: {
  items: SessionExercisePreview[];
  moreCount: number;
  compact: boolean;
  hero: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <View style={[styles.exerciseList, compact ? styles.exerciseListCompact : null]}>
      {items.map((item, index) =>
        hero ? (
          <View key={`${item.exerciseName}-${item.summary}-${index}`} style={styles.exerciseRowHero}>
            <View style={[styles.exerciseIndex, compact ? styles.exerciseIndexCompact : null]}>
              <Text
                style={[styles.exerciseIndexText, compact ? styles.exerciseIndexTextCompact : null]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[styles.exerciseNameHero, compact ? styles.exerciseNameCompact : null]}
              numberOfLines={1}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {item.exerciseName}
            </Text>
            {item.summary ? (
              <Text
                style={[styles.exerciseSummaryHero, compact ? styles.exerciseSummaryCompact : null]}
                numberOfLines={1}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {item.summary}
              </Text>
            ) : null}
          </View>
        ) : (
          <View key={`${item.exerciseName}-${item.summary}-${index}`} style={styles.exerciseRow}>
            <Text
              style={[styles.exerciseName, compact ? styles.exerciseNameCompact : null]}
              numberOfLines={1}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {item.exerciseName}
            </Text>
            {item.summary ? (
              <Text
                style={[styles.exerciseSummary, compact ? styles.exerciseSummaryCompact : null]}
                numberOfLines={1}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {item.summary}
              </Text>
            ) : null}
          </View>
        )
      )}
      {moreCount > 0 ? (
        <Text style={styles.moreExercises} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          +{moreCount} ejercicio{moreCount === 1 ? "" : "s"} más
        </Text>
      ) : null}
    </View>
  );
}

function MetricChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

/** Tarjeta de sesión vinculada al pie de un post Training. */
export function PostSessionAttachment({
  workoutTitle,
  performedAt,
  sessionNotes,
  metrics,
  empty = false,
  onPress,
  onPressLink,
  compact = false,
  linked = false,
  showViewFullCta = false,
  exercisePreviews = [],
  moreExercisesCount = 0,
}: PostSessionAttachmentProps) {
  if (empty) {
    return (
      <Pressable
        onPress={onPressLink}
        disabled={!onPressLink}
        style={({ pressed }) => [
          styles.card,
          styles.cardEmpty,
          compact ? styles.cardCompact : null,
          onPressLink && pressed ? styles.pressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Vincular sesión realizada"
        accessibilityHint="Abre el selector de sesiones de entrenamiento"
      >
        <View style={styles.iconWrap}>
          <TabDumbbellIcon size={18} color={AUTH.gold} filled />
        </View>
        <View style={styles.body}>
          <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Vincular sesión
          </Text>
          <Text style={styles.emptySub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Elige un entreno que hayas completado
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  }

  const title = workoutTitle?.trim() || "Entrenamiento";
  const dateLabel = performedAt ? formatSessionPerformedAt(performedAt) : null;
  const parsedNotes = sessionNotes ? parseSessionNotesSummary(sessionNotes) : null;
  const notesSetsRatio = parseSetsRatioFromLabel(parsedNotes?.setsLabel);
  const completedSets = metrics?.completedSets ?? notesSetsRatio?.completed ?? null;
  const totalSets = metrics?.totalSets ?? notesSetsRatio?.total ?? null;
  const setsLabel =
    totalSets != null && totalSets > 0
      ? `${completedSets ?? 0}/${totalSets} series`
      : parsedNotes?.setsLabel
        ? `${parsedNotes.setsLabel} series`
        : null;
  const exercisesLabel =
    metrics?.totalExercises != null && metrics.totalExercises > 0
      ? `${metrics.completedExercises ?? 0}/${metrics.totalExercises} ejercicios`
      : null;
  const showProgress = totalSets != null && totalSets > 0;
  const progressCompleted = completedSets ?? 0;
  const progressTotal = totalSets ?? 0;

  const chips = [setsLabel && !showProgress ? setsLabel : null, exercisesLabel]
    .filter(Boolean) as string[];
  const notesPreview = !exercisePreviews.length ? parsedNotes?.bodyNotes?.trim() : "";
  const showCta = Boolean(onPress) || showViewFullCta;
  const maxExercises = compact ? PREVIEW_MAX_EXERCISES_COMPACT : PREVIEW_MAX_EXERCISES_DEFAULT;
  const visibleExercises = exercisePreviews.slice(0, maxExercises);
  const moreCount =
    moreExercisesCount > 0
      ? moreExercisesCount
      : Math.max(0, exercisePreviews.length - visibleExercises.length);

  const useHero = !compact;
  const cardStyle = [
    useHero ? styles.cardHero : styles.card,
    useHero
      ? {
          borderColor: linked ? "rgba(212, 175, 55, 0.45)" : POST_PREVIEW_CARD.border,
          backgroundColor: linked ? "rgba(22, 20, 16, 0.96)" : "rgba(14, 14, 18, 0.98)",
        }
      : null,
    linked && !useHero ? styles.cardLinked : null,
    linked && useHero ? styles.cardHeroLinked : null,
    compact ? styles.cardCompact : null,
  ];

  const bodyContent = useHero ? (
    <View style={styles.heroBody}>
      <View style={styles.heroHeader}>
        <View style={styles.heroHeaderLeft}>
          <View style={styles.iconWrapHero}>
            <TabDumbbellIcon size={16} color={AUTH.gold} filled />
          </View>
          <View style={styles.heroEyebrowCol}>
            <Text style={styles.heroEyebrow} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Sesión de entreno
            </Text>
            {dateLabel ? (
              <Text style={styles.heroDate} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {dateLabel}
              </Text>
            ) : null}
          </View>
        </View>
        {linked ? (
          <View style={styles.linkedBadge}>
            <Text style={styles.linkedBadgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Vinculada
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.heroTitle} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>

      {showProgress ? (
        <SessionProgressBar completed={progressCompleted} total={progressTotal} compact={false} />
      ) : chips.length > 0 ? (
        <View style={styles.chipsRow}>
          {chips.map((chip) => (
            <MetricChip key={chip} label={chip} />
          ))}
        </View>
      ) : null}

      {exercisesLabel && showProgress ? (
        <Text style={styles.heroSecondaryStat} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {exercisesLabel}
        </Text>
      ) : null}

      {visibleExercises.length > 0 ? (
        <SessionExercisePreviewList
          items={visibleExercises}
          moreCount={moreCount}
          compact={false}
          hero
        />
      ) : notesPreview ? (
        <Text style={styles.notesPreview} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {notesPreview}
        </Text>
      ) : null}

      {showCta ? (
        <View style={styles.ctaRow}>
          <Text style={styles.ctaRowText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Ver entreno completo
          </Text>
          <Text style={styles.ctaRowChevron} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            ›
          </Text>
        </View>
      ) : null}
    </View>
  ) : (
    <View style={styles.body}>
      {linked ? (
        <View style={styles.linkedBadge}>
          <Text style={styles.linkedBadgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Sesión vinculada
          </Text>
        </View>
      ) : null}
      <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>
      {dateLabel ? (
        <Text style={styles.meta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sesión · {dateLabel}
        </Text>
      ) : null}
      {showProgress ? (
        <SessionProgressBar completed={progressCompleted} total={progressTotal} compact />
      ) : chips.length > 0 ? (
        <View style={styles.chipsRow}>
          {chips.map((chip) => (
            <MetricChip key={chip} label={chip} />
          ))}
        </View>
      ) : null}
      {visibleExercises.length > 0 ? (
        <SessionExercisePreviewList
          items={visibleExercises}
          moreCount={moreCount}
          compact
          hero={false}
        />
      ) : notesPreview ? (
        <Text style={styles.notesPreview} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {notesPreview}
        </Text>
      ) : null}
      {showCta ? (
        <Text style={styles.cta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Ver entreno completo ›
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={`Sesión ${title}`}
        accessibilityHint="Abre el entreno completo"
      >
        {!useHero ? (
          <View style={styles.iconWrap}>
            <TabDumbbellIcon size={18} color={AUTH.gold} filled />
          </View>
        ) : null}
        {bodyContent}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {!useHero ? (
        <View style={styles.iconWrap}>
          <TabDumbbellIcon size={18} color={AUTH.gold} filled />
        </View>
      ) : null}
      {bodyContent}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 14,
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
    backgroundColor: "rgba(14, 14, 18, 0.98)",
  },
  cardHero: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 0,
  },
  cardHeroLinked: {
    shadowColor: AUTH.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompact: {
    marginHorizontal: 10,
    padding: 10,
  },
  cardLinked: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(22, 20, 16, 0.96)",
  },
  cardEmpty: {
    flexDirection: "row",
    borderStyle: "dashed",
    borderColor: "rgba(212, 175, 55, 0.38)",
    backgroundColor: "rgba(14, 14, 16, 0.75)",
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
  },
  iconWrapHero: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
  },
  body: { flex: 1, minWidth: 0, gap: 4 },
  heroBody: { flex: 1, minWidth: 0, gap: 10 },
  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  heroHeaderLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  heroEyebrowCol: { flex: 1, gap: 2, minWidth: 0 },
  heroEyebrow: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  heroDate: { color: AUTH.muted, fontSize: 12, fontWeight: "600" },
  heroTitle: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  heroSecondaryStat: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: -4,
  },
  linkedBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(212, 175, 55, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  linkedBadgeText: { color: AUTH.gold, fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  title: { color: AUTH.neutral100, fontSize: 15, fontWeight: "700" },
  meta: { color: AUTH.faint, fontSize: 12, fontWeight: "600" },
  progressBlock: { gap: 6, marginTop: 2 },
  progressBlockCompact: { marginTop: 0 },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(115, 115, 115, 0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: AUTH.gold,
  },
  progressLabel: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
  },
  chipText: { color: AUTH.gold, fontSize: 11, fontWeight: "600" },
  notesPreview: { color: AUTH.muted, fontSize: 12, lineHeight: 17 },
  exerciseList: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(115, 115, 115, 0.22)",
    gap: 8,
  },
  exerciseListCompact: { paddingTop: 6, gap: 5 },
  exerciseRow: { gap: 2 },
  exerciseRowHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exerciseIndex: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  exerciseIndexCompact: { width: 20, height: 20, borderRadius: 6 },
  exerciseIndexText: { color: AUTH.gold, fontSize: 11, fontWeight: "800" },
  exerciseIndexTextCompact: { fontSize: 10 },
  exerciseName: { color: AUTH.neutral100, fontSize: 13, fontWeight: "600" },
  exerciseNameHero: { flex: 1, color: AUTH.neutral100, fontSize: 14, fontWeight: "600" },
  exerciseNameCompact: { fontSize: 12 },
  exerciseSummary: { color: AUTH.muted, fontSize: 12, lineHeight: 16 },
  exerciseSummaryHero: {
    flexShrink: 0,
    maxWidth: "42%",
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  exerciseSummaryCompact: { fontSize: 11, lineHeight: 15 },
  moreExercises: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  cta: { color: AUTH.gold, fontSize: 13, fontWeight: "700", marginTop: 8 },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
  },
  ctaRowText: { color: AUTH.gold, fontSize: 13, fontWeight: "700" },
  ctaRowChevron: { color: AUTH.gold, fontSize: 18, fontWeight: "300", marginTop: -1 },
  emptyTitle: { color: AUTH.neutral100, fontSize: 14, fontWeight: "700" },
  emptySub: { color: AUTH.muted, fontSize: 12, lineHeight: 17 },
  chevron: { color: AUTH.muted, fontSize: 22, fontWeight: "300", alignSelf: "center" },
});
