import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthTopGlow } from "../AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { CHOOSER_PREVIEW_MAX_WIDTH } from "../../constants/postFormatChooserPreview";
import { POST_FORMAT_LABELS, type PostFormat } from "../../constants/postFormat";
import { useAuth } from "../../context/AuthContext";
import { hapticLight } from "../../utils/appHaptics";
import { CreatePostFormatSegment } from "./editor/CreatePostFormatSegment";
import { ChooserPreviewFit } from "./preview/ChooserPreviewFit";
import { PostFeedPreviewStandard } from "./preview/PostFeedPreviewStandard";
import { PostFeedPreviewTraining } from "./preview/PostFeedPreviewTraining";
import {
  buildSessionExercisePreviews,
  countRemainingExercises,
} from "../../utils/sessionExercisePreview";
import type { PostPreviewDraft } from "./preview/postPreviewTypes";

type SessionPreviewHint = {
  workoutTitle: string;
  performedAt: string;
};

type CreatePostFormatChooserProps = {
  onSelect: (format: PostFormat) => void;
  suggestedFormat?: PostFormat;
  hasLinkedSession?: boolean;
  sessionPreview?: SessionPreviewHint | null;
};

type FormatSlide = {
  format: PostFormat;
  title: string;
  bullets: string[];
};

const SLIDES: FormatSlide[] = [
  {
    format: "standard",
    title: POST_FORMAT_LABELS.standard,
    bullets: [
      "Foto cuadrada obligatoria",
      "Caption bajo los iconos del feed",
      "Entreno vinculado opcional (icono mancuerna)",
    ],
  },
  {
    format: "training",
    title: "Training",
    bullets: [
      "Tarjeta de sesión como protagonista",
      "Comentario sobre el entreno",
      "Foto opcional al final del post",
    ],
  },
];

const SLIDE_WIDTH_RATIO = 0.88;
const SLIDE_GAP = 12;

function buildChooserDraft(
  format: PostFormat,
  username: string,
  avatarUrl: string | null | undefined,
  hasLinkedSession: boolean,
  sessionPreview?: SessionPreviewHint | null
): PostPreviewDraft {
  const now = new Date().toISOString();
  if (format === "training") {
    const workoutTitle = sessionPreview?.workoutTitle
      ?? (hasLinkedSession ? "Tu sesión" : "Push · ejemplo");
    const exampleSnapshot = {
      workoutTitle,
      completedSets: 12,
      totalSets: 14,
      completedExercises: 4,
      totalExercises: 5,
      blocks: [
        {
          exerciseId: "ex1",
          exerciseName: "Press banca",
          sets: [
            { done: true, plannedReps: "10", plannedWeight: "60", actualReps: "10", actualWeight: "60" },
            { done: true, plannedReps: "8", plannedWeight: "65", actualReps: "8", actualWeight: "65" },
          ],
        },
        {
          exerciseId: "ex2",
          exerciseName: "Remo con barra",
          sets: [{ done: true, plannedReps: "10", plannedWeight: "50", actualReps: "10", actualWeight: "50" }],
        },
      ],
    };
    const previews = buildSessionExercisePreviews(exampleSnapshot, 2);
    return {
      format: "training",
      username,
      avatarUrl,
      content: "¡Buen entreno!",
      visibility: "public",
      imageUris: [],
      workoutTitle,
      sessionId: hasLinkedSession ? "preview-session" : "preview",
      sessionPerformedAt: sessionPreview?.performedAt ?? now,
      sessionCompletedSets: 12,
      sessionTotalSets: 14,
      sessionCompletedExercises: 4,
      sessionTotalExercises: 5,
      sessionSnapshot: exampleSnapshot,
      sessionExercisePreviews: previews,
      sessionMoreExercisesCount: countRemainingExercises(exampleSnapshot, previews.length),
    };
  }
  return {
    format: "standard",
    username,
    avatarUrl,
    content: "Mi mejor serie del día 💪",
    visibility: "public",
    imageUris: [],
    workoutTitle: null,
  };
};

type FormatSlideCardProps = {
  slide: FormatSlide;
  slideWidth: number;
  previewWidth: number;
  draft: PostPreviewDraft;
};

function FormatSlideCard({ slide, slideWidth, previewWidth, draft }: FormatSlideCardProps) {
  const isTraining = slide.format === "training";

  return (
    <View
      style={[styles.slide, { width: slideWidth, height: "100%" }]}
      accessibilityRole="tab"
      accessibilityLabel={slide.title}
    >
      <View style={styles.previewFrame}>
        <ChooserPreviewFit key={slide.format} width={previewWidth}>
          {isTraining ? (
            <PostFeedPreviewTraining
              draft={draft}
              fullBleed={false}
              layoutWidth={previewWidth}
              embedded
              compact
              formatChooser
            />
          ) : (
            <PostFeedPreviewStandard
              draft={draft}
              fullBleed={false}
              layoutWidth={previewWidth}
              embedded
              compact
              formatChooser
            />
          )}
        </ChooserPreviewFit>
      </View>
    </View>
  );
}

function ActiveFormatMeta({ slide, suggested }: { slide: FormatSlide; suggested: boolean }) {
  return (
    <View style={styles.formatMeta}>
      <View style={styles.formatMetaHead}>
        <Text style={styles.formatMetaTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {slide.title}
        </Text>
        {suggested ? (
          <View style={styles.formatMetaBadge}>
            <Text style={styles.formatMetaBadgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Recomendado
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.bullets}>
        {slide.bullets.map((line) => (
          <View key={line} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {line}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function CreatePostFormatChooser({
  onSelect,
  suggestedFormat,
  hasLinkedSession = false,
  sessionPreview = null,
}: CreatePostFormatChooserProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { user } = useAuth();
  const listRef = useRef<FlatList<FormatSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(suggestedFormat === "training" ? 1 : 0);

  const username = user?.username ?? "tu_usuario";
  const avatarUrl = user?.avatarUrl ?? null;

  const slideWidth = Math.round(screenWidth * SLIDE_WIDTH_RATIO);
  const slideStride = slideWidth + SLIDE_GAP;
  const sidePadding = Math.round((screenWidth - slideWidth) / 2);
  const previewWidth = Math.min(CHOOSER_PREVIEW_MAX_WIDTH, slideWidth - 16);

  const standardDraft = useMemo(
    () => buildChooserDraft("standard", username, avatarUrl, hasLinkedSession, sessionPreview),
    [username, avatarUrl, hasLinkedSession, sessionPreview]
  );
  const trainingDraft = useMemo(
    () => buildChooserDraft("training", username, avatarUrl, hasLinkedSession, sessionPreview),
    [username, avatarUrl, hasLinkedSession, sessionPreview]
  );

  const pick = useCallback(
    (format: PostFormat) => {
      hapticLight();
      onSelect(format);
    },
    [onSelect]
  );

  const scrollToFormat = useCallback((format: PostFormat) => {
    const index = format === "training" ? 1 : 0;
    setActiveIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onSegmentChange = useCallback(
    (format: PostFormat) => {
      hapticLight();
      scrollToFormat(format);
    },
    [scrollToFormat]
  );

  const syncIndexFromScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / slideStride);
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, index));
      setActiveIndex((prev) => (prev === clamped ? prev : clamped));
    },
    [slideStride]
  );

  useEffect(() => {
    if (suggestedFormat !== "training") return;
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex({ index: 1, animated: false });
    }, 50);
    return () => clearTimeout(t);
  }, [suggestedFormat]);

  const renderItem: ListRenderItem<FormatSlide> = useCallback(
    ({ item }) => {
      const draft = item.format === "standard" ? standardDraft : trainingDraft;
      return (
        <FormatSlideCard
          slide={item}
          slideWidth={slideWidth}
          previewWidth={previewWidth}
          draft={draft}
        />
      );
    },
    [standardDraft, trainingDraft, slideWidth, previewWidth]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<FormatSlide> | null | undefined, index: number) => ({
      length: slideStride,
      offset: slideStride * index,
      index,
    }),
    [slideStride]
  );

  const activeSlide = SLIDES[activeIndex] ?? SLIDES[0]!;
  const activeFormat = activeSlide.format;
  const sessionBannerTitle = sessionPreview?.workoutTitle?.trim();
  const initialScrollIndex = suggestedFormat === "training" ? 1 : 0;
  const showSessionBanner = hasLinkedSession && Boolean(sessionBannerTitle);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 8 }]}>
      <AuthTopGlow width={screenWidth} windowHeight={screenHeight} />

      <View style={styles.topChrome}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Cancelar">
            <Text style={styles.cancel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cancelar
            </Text>
          </Pressable>
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Publicar
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Elige el formato del post en el feed
        </Text>

        {showSessionBanner ? (
          <View style={styles.sessionBanner}>
            <Text style={styles.sessionBannerTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Acabas de terminar «{sessionBannerTitle}»
            </Text>
            <Text style={styles.sessionBannerSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Training suele encajar mejor para compartir la sesión completa.
            </Text>
          </View>
        ) : null}

        <View style={styles.segmentWrap}>
          <CreatePostFormatSegment value={activeFormat} onChange={onSegmentChange} compact />
        </View>

        <ActiveFormatMeta
          slide={activeSlide}
          suggested={suggestedFormat === activeSlide.format}
        />
      </View>

      <View style={styles.carouselHost}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.format}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={slideStride}
          snapToAlignment="start"
          disableIntervalMomentum
          bounces={false}
          onMomentumScrollEnd={syncIndexFromScroll}
          onScrollEndDrag={syncIndexFromScroll}
          initialScrollIndex={initialScrollIndex}
          initialNumToRender={2}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={() => {
            listRef.current?.scrollToOffset({ offset: slideStride, animated: false });
          }}
          contentContainerStyle={{ paddingHorizontal: sidePadding }}
          ItemSeparatorComponent={() => <View style={{ width: SLIDE_GAP }} />}
          renderItem={renderItem}
          style={styles.carousel}
        />
      </View>

      <View style={styles.bottomChrome}>
        <View style={styles.dots} accessibilityRole="tablist">
          {SLIDES.map((slide, i) => (
            <Pressable
              key={slide.format}
              onPress={() => onSegmentChange(slide.format)}
              accessibilityRole="tab"
              accessibilityState={{ selected: i === activeIndex }}
              accessibilityLabel={slide.title}
              hitSlop={8}
            >
              <View style={[styles.dot, i === activeIndex ? styles.dotActive : null]} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => pick(activeFormat)}
          style={({ pressed }) => [styles.bottomCta, pressed ? styles.bottomCtaPressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Continuar con ${activeSlide.title}`}
        >
          <Text style={styles.bottomCtaText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Continuar con {activeSlide.title}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  topChrome: {
    flexShrink: 0,
  },
  bottomChrome: {
    flexShrink: 0,
    paddingTop: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  cancel: { color: AUTH.muted, fontSize: 16, width: 80 },
  title: {
    flex: 1,
    textAlign: "center",
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: { width: 80 },
  subtitle: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  segmentWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  formatMeta: {
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.45)",
    backgroundColor: "rgba(12, 12, 14, 0.75)",
    gap: 4,
  },
  formatMetaHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  formatMetaTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "800",
  },
  formatMetaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
  },
  formatMetaBadgeText: {
    color: AUTH.gold,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  carouselHost: {
    flex: 1,
    minHeight: 0,
    marginBottom: 4,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.55)",
    backgroundColor: "rgba(12, 12, 14, 0.92)",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  previewFrame: {
    flex: 1,
    minHeight: 0,
    borderRadius: 12,
    backgroundColor: "#0a0a0c",
    overflow: "hidden",
  },
  sessionBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(35, 32, 22, 0.75)",
    gap: 2,
  },
  sessionBannerTitle: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  sessionBannerSub: {
    color: AUTH.muted,
    fontSize: 11,
    lineHeight: 15,
  },
  bullets: {
    gap: 2,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AUTH.gold,
    marginTop: 5,
  },
  bulletText: {
    flex: 1,
    color: AUTH.muted,
    fontSize: 11,
    lineHeight: 15,
  },
  bottomCta: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: AUTH.gold,
    alignItems: "center",
  },
  bottomCtaPressed: { opacity: 0.9 },
  bottomCtaText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(115, 115, 115, 0.45)",
  },
  dotActive: {
    width: 20,
    backgroundColor: AUTH.muted,
  },
});
