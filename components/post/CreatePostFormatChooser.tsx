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
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthTopGlow } from "../AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PostFormat } from "../../constants/postFormat";
import { useAuth } from "../../context/AuthContext";
import { hapticLight } from "../../utils/appHaptics";
import { CreatePostFormatSegment } from "./editor/CreatePostFormatSegment";
import { PostFeedPreviewStandard } from "./preview/PostFeedPreviewStandard";
import { PostFeedPreviewTraining } from "./preview/PostFeedPreviewTraining";
import { PreviewBottomFade } from "./preview/PreviewBottomFade";
import {
  buildSessionExercisePreviews,
  countRemainingExercises,
} from "../../utils/sessionExercisePreview";
import type { PostPreviewDraft } from "./preview/postPreviewTypes";

const SLIDE_WIDTH_RATIO = 0.84;
const SLIDE_GAP = 14;
const PREVIEW_MAX_HEIGHT_RATIO = 0.36;

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
    title: "Publicación",
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
        {
          exerciseId: "ex3",
          exerciseName: "Press militar",
          sets: [{ done: true, plannedReps: "12", plannedWeight: "30", actualReps: "12", actualWeight: "30" }],
        },
      ],
    };
    const previews = buildSessionExercisePreviews(exampleSnapshot);
    return {
      format: "training",
      username,
      avatarUrl,
      content: "¡Buen entreno!",
      visibility: "public",
      imageUris: [],
      workoutTitle,
      sessionId: hasLinkedSession ? "preview-session" : null,
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
  previewInnerWidth: number;
  previewMaxHeight: number;
  draft: PostPreviewDraft;
  suggested: boolean;
  onPress: () => void;
};

function FormatSlideCard({
  slide,
  slideWidth,
  previewInnerWidth,
  previewMaxHeight,
  draft,
  suggested,
  onPress,
}: FormatSlideCardProps) {
  const scale = useSharedValue(1);
  const isTraining = slide.format === "training";

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.98, { damping: 18, stiffness: 320 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  };

  const a11yHint =
    slide.format === "training"
      ? "Formato con tarjeta de sesión debajo del comentario"
      : "Formato con foto cuadrada y caption bajo los iconos";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.slide,
        { width: slideWidth },
        animatedCard,
        suggested ? styles.slideSuggested : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={slide.title}
      accessibilityHint={a11yHint}
    >
      {suggested ? (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Recomendado
          </Text>
        </View>
      ) : null}

      <View style={[styles.previewClip, { maxHeight: previewMaxHeight }]}>
        {isTraining ? (
          <PostFeedPreviewTraining
            draft={draft}
            fullBleed={false}
            layoutWidth={previewInnerWidth}
            compact
            embedded
            showViewFullCta={Boolean(draft.sessionId)}
          />
        ) : (
          <PostFeedPreviewStandard
            draft={draft}
            fullBleed={false}
            layoutWidth={previewInnerWidth}
            compact
            embedded
          />
        )}
        <PreviewBottomFade width={previewInnerWidth} gradientId={`fade-${slide.format}`} />
      </View>

      <View style={styles.slideFooter}>
        <Text style={styles.slideTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {slide.title}
        </Text>
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
    </AnimatedPressable>
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
  const previewInnerWidth = slideWidth - 20;
  const previewMaxHeight = Math.min(400, Math.round(screenHeight * PREVIEW_MAX_HEIGHT_RATIO));

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

  const scrollToFormat = useCallback(
    (format: PostFormat) => {
      const index = format === "training" ? 1 : 0;
      setActiveIndex(index);
      listRef.current?.scrollToIndex({ index, animated: true });
    },
    []
  );

  const onSegmentChange = useCallback(
    (format: PostFormat) => {
      hapticLight();
      scrollToFormat(format);
    },
    [scrollToFormat]
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / slideStride);
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, index));
      setActiveIndex((prev) => (prev === clamped ? prev : clamped));
    },
    [slideStride]
  );

  const initialScrollIndex = suggestedFormat === "training" ? 1 : 0;

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
          previewInnerWidth={previewInnerWidth}
          previewMaxHeight={previewMaxHeight}
          draft={draft}
          suggested={suggestedFormat === item.format}
          onPress={() => pick(item.format)}
        />
      );
    },
    [
      standardDraft,
      trainingDraft,
      slideWidth,
      previewInnerWidth,
      previewMaxHeight,
      suggestedFormat,
      pick,
    ]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<FormatSlide> | null | undefined, index: number) => ({
      length: slideStride,
      offset: slideStride * index,
      index,
    }),
    [slideStride]
  );

  const activeFormat = SLIDES[activeIndex]?.format ?? "standard";
  const sessionBannerTitle = sessionPreview?.workoutTitle?.trim();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <AuthTopGlow width={screenWidth} windowHeight={screenHeight} />

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

      {hasLinkedSession && sessionBannerTitle ? (
        <View style={styles.sessionBanner}>
          <Text style={styles.sessionBannerTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Acabas de terminar «{sessionBannerTitle}»
          </Text>
          <Text style={styles.sessionBannerSub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Training suele encajar mejor para compartir la sesión completa.
          </Text>
        </View>
      ) : null}

      <CreatePostFormatSegment value={activeFormat} onChange={onSegmentChange} />

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
        onScroll={onScroll}
        scrollEventThrottle={16}
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

      <View style={styles.dots} accessibilityRole="tablist">
        {SLIDES.map((slide, i) => (
          <View
            key={slide.format}
            style={[styles.dot, i === activeIndex ? styles.dotActive : null]}
            accessibilityLabel={`${slide.title}${i === activeIndex ? ", seleccionado" : ""}`}
          />
        ))}
      </View>

      <Pressable
        onPress={() => pick(activeFormat)}
        style={({ pressed }) => [styles.bottomCta, pressed ? styles.bottomCtaPressed : null]}
        accessibilityRole="button"
        accessibilityLabel={`Continuar con ${SLIDES[activeIndex]?.title ?? "formato"}`}
      >
        <Text style={styles.bottomCtaText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Continuar con {SLIDES[activeIndex]?.title ?? "Publicación"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  carousel: {
    flexGrow: 0,
    flexShrink: 1,
  },
  slide: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.55)",
    backgroundColor: "rgba(12, 12, 14, 0.92)",
    overflow: "hidden",
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 14,
  },
  slideSuggested: {
    borderColor: "rgba(163, 163, 163, 0.55)",
    backgroundColor: "rgba(18, 18, 20, 0.98)",
  },
  recommendedBadge: {
    alignSelf: "center",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(212, 175, 55, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.5)",
  },
  recommendedText: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  previewClip: {
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#0a0a0c",
  },
  slideFooter: {
    marginTop: 14,
    alignItems: "center",
    gap: 4,
  },
  slideTitle: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "800",
  },
  sessionBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(35, 32, 22, 0.75)",
    gap: 4,
  },
  sessionBannerTitle: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  sessionBannerSub: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  bullets: {
    marginTop: 8,
    gap: 6,
    alignSelf: "stretch",
    paddingHorizontal: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: AUTH.gold,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  bottomCta: {
    marginHorizontal: 16,
    marginTop: 14,
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
    marginTop: 18,
    paddingBottom: 4,
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
