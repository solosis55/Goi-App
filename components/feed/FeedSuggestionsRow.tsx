import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, ScrollView, View } from "react-native";
import { toggleFollow } from "../../api/auth";
import type { DiscoverUser } from "../../types/auth";
import {
  FEED_SUGGESTIONS_CAROUSEL_MAX,
  FEED_SUGGESTIONS_SNOOZE_DAYS,
} from "../../constants/feedSuggestions";
import type { FeedScope } from "../../constants/feed";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { ProfileSectionSurface } from "../profile/ProfileSectionSurface";
import { FeedSuggestionCard } from "./FeedSuggestionCard";
import { FeedSuggestionsSectionHeader } from "./FeedSuggestionsSectionHeader";
import { FeedSuggestionsSkeleton } from "./FeedSuggestionsSkeleton";
import { feedSuggestionsHeaderCopy, type FeedSuggestionsVariant } from "./feedSuggestionsCopy";
import { feedSuggestionsStyles as styles } from "./feedSuggestionsStyles";

export type { FeedSuggestionsVariant } from "./feedSuggestionsCopy";

const FOLLOW_SUCCESS_MS = 1400;

type FeedSuggestionsRowProps = {
  users: DiscoverUser[];
  followingIds: string[];
  currentUserId: string | undefined;
  feedScope?: FeedScope;
  variant?: FeedSuggestionsVariant;
  loading?: boolean;
  onSnooze?: () => void;
  onDismissPermanent?: () => void;
  onFollowingChanged: (targetId: string, following: boolean, pending?: boolean) => void;
  showManageInSocial?: boolean;
  embedded?: boolean;
};

function SuggestionsCarousel({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {children}
    </ScrollView>
  );
}

function FeedSuggestionsRowInner({
  users,
  followingIds,
  currentUserId,
  feedScope,
  variant = "header",
  loading,
  onSnooze,
  onDismissPermanent,
  onFollowingChanged,
  embedded = false,
  showManageInSocial = false,
}: FeedSuggestionsRowProps) {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [optimisticPending, setOptimisticPending] = useState<Set<string>>(() => new Set());
  const [followedIds, setFollowedIds] = useState<Set<string>>(() => new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const fadeAnim = useRef(new Animated.Value(variant === "inline" ? 1 : 0)).current;
  const hideTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const skipFade = variant === "inline";

  const carouselMax = variant === "list" ? users.length : FEED_SUGGESTIONS_CAROUSEL_MAX;

  const suggestions = useMemo(
    () =>
      users
        .filter(
          (u) => u.id !== currentUserId && !followingIds.includes(u.id) && !hiddenIds.has(u.id)
        )
        .slice(0, carouselMax),
    [users, currentUserId, followingIds, hiddenIds, carouselMax]
  );

  const copy = feedSuggestionsHeaderCopy(feedScope, variant);

  useEffect(() => {
    if (skipFade || suggestions.length === 0) return;
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [skipFade, suggestions.length, fadeAnim]);

  useEffect(() => {
    return () => {
      for (const t of hideTimers.current.values()) clearTimeout(t);
      hideTimers.current.clear();
    };
  }, []);

  const scheduleHide = useCallback((userId: string) => {
    const existing = hideTimers.current.get(userId);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      setHiddenIds((prev) => new Set(prev).add(userId));
      setFollowedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      hideTimers.current.delete(userId);
    }, FOLLOW_SUCCESS_MS);
    hideTimers.current.set(userId, t);
  }, []);

  const handleFollow = useCallback(
    (u: DiscoverUser) => {
      if (pendingIds.has(u.id) || followedIds.has(u.id) || u.followPending || optimisticPending.has(u.id))
        return;
      setPendingIds((prev) => new Set(prev).add(u.id));
      setOptimisticPending((prev) => new Set(prev).add(u.id));
      onFollowingChanged(u.id, false, true);
      void toggleFollow(u.id)
        .then(({ following, pending, status }) => {
          const isPending = pending === true || status === "pending";
          if (isPending) {
            onFollowingChanged(u.id, false, true);
            return;
          }
          onFollowingChanged(u.id, following, false);
          if (following) {
            setFollowedIds((prev) => new Set(prev).add(u.id));
            scheduleHide(u.id);
          }
        })
        .catch(() => {
          onFollowingChanged(u.id, false, false);
        })
        .finally(() => {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(u.id);
            return next;
          });
          setOptimisticPending((prev) => {
            const next = new Set(prev);
            next.delete(u.id);
            return next;
          });
        });
    },
    [onFollowingChanged, pendingIds, followedIds, optimisticPending, scheduleHide]
  );

  const handleManageInSocial = useCallback(() => {
    router.push({ pathname: "/(tabs)/social", params: { discover: "1" } });
  }, [router]);

  const handleDismissPress = useCallback(() => {
    if (!onSnooze && !onDismissPermanent) return;
    showAlert({
      title: "Sugerencias",
      message: "¿Cómo quieres ocultarlas?",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        ...(onSnooze
          ? [
              {
                text: `Ocultar ${FEED_SUGGESTIONS_SNOOZE_DAYS} días`,
                style: "default" as const,
                onPress: onSnooze,
              },
            ]
          : []),
        ...(onDismissPermanent
          ? [
              {
                text: "No mostrar más",
                style: "destructive" as const,
                onPress: onDismissPermanent,
              },
            ]
          : []),
      ],
    });
  }, [onSnooze, onDismissPermanent, showAlert]);

  const handleSeeAll = useCallback(() => {
    router.push({ pathname: "/(tabs)/social", params: { discover: "1" } });
  }, [router]);

  if (loading && suggestions.length === 0) {
    return skipFade ? <FeedSuggestionsLoadingRow inline /> : null;
  }

  if (suggestions.length === 0) return null;

  const surfaceStyle = variant === "inline" ? styles.surfaceInline : styles.surface;
  const showSeeAll = variant !== "list" && !embedded;
  const showHeader = !embedded || variant !== "list";

  const body = (
    <>
      {showHeader ? (
        <FeedSuggestionsSectionHeader
          title={copy.title}
          subtitle={copy.subtitle}
          onDismissPress={onSnooze || onDismissPermanent ? handleDismissPress : undefined}
          onSeeAll={showSeeAll ? handleSeeAll : undefined}
          onManageInSocial={showManageInSocial && !embedded ? handleManageInSocial : undefined}
        />
      ) : null}
      {variant === "list" ? (
        <View style={[styles.listColumn, embedded ? styles.listColumnEmbedded : null]}>
          {suggestions.map((u, index) => (
            <View
              key={`${u.id || "user"}-${index}`}
              style={[styles.listCardWrap, index < suggestions.length - 1 ? styles.listRowDivider : null]}
            >
              <FeedSuggestionCard
                user={u}
                layout="row"
                fullWidth
                pending={pendingIds.has(u.id) || optimisticPending.has(u.id)}
                followed={followedIds.has(u.id)}
                onOpenProfile={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
                onFollow={() => handleFollow(u)}
              />
            </View>
          ))}
        </View>
      ) : (
        <SuggestionsCarousel>
          {suggestions.map((u, index) => (
            <View key={`${u.id || "user"}-${index}`} style={styles.carouselItem}>
              <FeedSuggestionCard
                user={u}
                pending={pendingIds.has(u.id) || optimisticPending.has(u.id)}
                followed={followedIds.has(u.id)}
                onOpenProfile={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
                onFollow={() => handleFollow(u)}
              />
            </View>
          ))}
        </SuggestionsCarousel>
      )}
    </>
  );

  const surface = embedded ? (
    body
  ) : (
    <ProfileSectionSurface flush style={surfaceStyle}>
      {body}
    </ProfileSectionSurface>
  );

  if (skipFade) {
    return <View collapsable={false}>{surface}</View>;
  }

  return <Animated.View style={{ opacity: fadeAnim }}>{surface}</Animated.View>;
}

export const FeedSuggestionsRow = memo(FeedSuggestionsRowInner);

export const FeedInlineSuggestionsRow = memo(function FeedInlineSuggestionsRow(
  props: Omit<FeedSuggestionsRowProps, "variant">
) {
  return <FeedSuggestionsRow {...props} variant="inline" />;
});

export function FeedSuggestionsLoadingRow({ inline = false }: { inline?: boolean }) {
  return (
    <ProfileSectionSurface flush style={inline ? styles.surfaceInline : styles.surface}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.titleSkeleton} />
          <View style={styles.subtitleSkeleton} />
        </View>
      </View>
      <FeedSuggestionsSkeleton count={4} />
    </ProfileSectionSurface>
  );
}
