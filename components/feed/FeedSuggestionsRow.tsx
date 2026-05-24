import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { toggleFollow } from "../../api/auth";
import type { DiscoverUser } from "../../types/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  FEED_SUGGESTIONS_CAROUSEL_MAX,
  FEED_SUGGESTIONS_SNOOZE_DAYS,
} from "../../constants/feedSuggestions";
import type { FeedScope } from "../../constants/feed";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { profileFollowButtonStyles as followStyles } from "../profile/profileFollowButtonStyles";
import { ProfileSectionSurface } from "../profile/ProfileSectionSurface";
import { UserAvatar } from "../ui/UserAvatar";
import { FeedSuggestionsSkeleton } from "./FeedSuggestionsSkeleton";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CARD_WIDTH = 92;
const SECTION_INSET = 14;
const FOLLOW_SUCCESS_MS = 1400;

export type FeedSuggestionsVariant = "inline" | "header" | "empty" | "list";

type FeedSuggestionsRowProps = {
  users: DiscoverUser[];
  followingIds: string[];
  currentUserId: string | undefined;
  feedScope?: FeedScope;
  variant?: FeedSuggestionsVariant;
  loading?: boolean;
  onSnooze?: () => void;
  onDismissPermanent?: () => void;
  onFollowingChanged: (targetId: string, following: boolean) => void;
};

function headerCopy(scope: FeedScope | undefined, variant: FeedSuggestionsVariant) {
  if (scope === "following" || variant === "empty") {
    return {
      title: "Para llenar tu feed",
      subtitle: "Sigue atletas y verás sus publicaciones aquí",
    };
  }
  if (variant === "inline") {
    return {
      title: "Amplía tu círculo",
      subtitle: "Atletas que encajan contigo",
    };
  }
  return {
    title: "Gente que podrías seguir",
    subtitle: "Descubre atletas en la comunidad",
  };
}

function SuggestionsSectionHeader({
  title,
  subtitle,
  onDismissPress,
  onSeeAll,
}: {
  title: string;
  subtitle: string;
  onDismissPress?: () => void;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {title}
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.headerActions}>
        {onSeeAll ? (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Ver todas las sugerencias"
            style={({ pressed }) => [styles.seeAllBtn, pressed ? styles.pressed : null]}
          >
            <Text style={styles.seeAllText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Ver todos
            </Text>
          </Pressable>
        ) : null}
        {onDismissPress ? (
          <Pressable
            onPress={onDismissPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Opciones de sugerencias"
            style={({ pressed }) => [styles.dismissBtn, pressed ? styles.pressed : null]}
          >
            <Text style={styles.dismissText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              ×
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function SuggestionsCarousel({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {children}
    </ScrollView>
  );
}

function MutualAvatars({ preview }: { preview: DiscoverUser["mutualPreview"] }) {
  if (!preview?.length) return null;
  return (
    <View style={styles.mutualRow}>
      {preview.map((m) => (
        <View key={m.id} style={styles.mutualAvatarWrap}>
          <UserAvatar src={m.avatarUrl} username={m.username} size={16} />
        </View>
      ))}
    </View>
  );
}

function SuggestionCard({
  user,
  pending,
  followed,
  fullWidth,
  onOpenProfile,
  onFollow,
}: {
  user: DiscoverUser;
  pending: boolean;
  followed: boolean;
  fullWidth?: boolean;
  onOpenProfile: () => void;
  onFollow: () => void;
}) {
  const reason = user.reason?.trim() || user.goal?.trim() || user.bio?.trim() || "Perfil en GoI";

  return (
    <View style={[styles.card, fullWidth ? styles.cardFullWidth : null]}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <Pressable
          onPress={onOpenProfile}
          style={({ pressed }) => [styles.cardProfile, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${user.username}`}
        >
          <View style={styles.avatarRing}>
            <UserAvatar src={user.avatarUrl} username={user.username} size={44} />
            {user.activeThisWeek ? <View style={styles.activeDot} /> : null}
          </View>
          <View style={styles.identity}>
            <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{user.username}
            </Text>
            <MutualAvatars preview={user.mutualPreview} />
            <Text style={styles.hint} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {reason}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onFollow}
          disabled={pending || followed}
          style={({ pressed }) => [
            followStyles.base,
            followed ? followStyles.following : followStyles.primary,
            styles.followBtn,
            pressed ? followStyles.pressed : null,
            pending ? followStyles.busy : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={followed ? `Siguiendo a ${user.username}` : `Seguir a ${user.username}`}
        >
          {pending ? (
            <ActivityIndicator size="small" color="#0a0a0a" />
          ) : (
            <Text
              style={[followed ? followStyles.textFollowing : followStyles.textPrimary, styles.followText]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {followed ? "Siguiendo ✓" : "Seguir"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function FeedSuggestionsRow({
  users,
  followingIds,
  currentUserId,
  feedScope,
  variant = "header",
  loading,
  onSnooze,
  onDismissPermanent,
  onFollowingChanged,
}: FeedSuggestionsRowProps) {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [followedIds, setFollowedIds] = useState<Set<string>>(() => new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hideTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const carouselMax = variant === "list" ? users.length : FEED_SUGGESTIONS_CAROUSEL_MAX;

  const suggestions = useMemo(
    () =>
      users
        .filter(
          (u) =>
            u.id !== currentUserId &&
            !followingIds.includes(u.id) &&
            !hiddenIds.has(u.id)
        )
        .slice(0, carouselMax),
    [users, currentUserId, followingIds, hiddenIds, carouselMax]
  );

  const copy = headerCopy(feedScope, variant);

  useEffect(() => {
    if (suggestions.length === 0) return;
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [suggestions.length, fadeAnim]);

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
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
      if (pendingIds.has(u.id) || followedIds.has(u.id)) return;
      setPendingIds((prev) => new Set(prev).add(u.id));
      void toggleFollow(u.id)
        .then(({ following }) => {
          onFollowingChanged(u.id, following);
          if (following) {
            setFollowedIds((prev) => new Set(prev).add(u.id));
            scheduleHide(u.id);
          }
        })
        .finally(() => {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(u.id);
            return next;
          });
        });
    },
    [onFollowingChanged, pendingIds, followedIds, scheduleHide]
  );

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
    router.push("/(tabs)/social");
  }, [router]);

  if (loading) return null;

  if (suggestions.length === 0) return null;

  const surfaceStyle = variant === "inline" ? styles.surfaceInline : styles.surface;
  const showSeeAll = variant !== "list";

  const body = (
    <>
      <SuggestionsSectionHeader
        title={copy.title}
        subtitle={copy.subtitle}
        onDismissPress={onSnooze || onDismissPermanent ? handleDismissPress : undefined}
        onSeeAll={showSeeAll ? handleSeeAll : undefined}
      />
      {variant === "list" ? (
        <View style={styles.listColumn}>
          {suggestions.map((u) => (
            <View key={u.id} style={styles.listCardWrap}>
              <SuggestionCard
                user={u}
                fullWidth
                pending={pendingIds.has(u.id)}
                followed={followedIds.has(u.id)}
                onOpenProfile={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
                onFollow={() => handleFollow(u)}
              />
            </View>
          ))}
        </View>
      ) : (
        <SuggestionsCarousel>
          {suggestions.map((u) => (
            <SuggestionCard
              key={u.id}
              user={u}
              pending={pendingIds.has(u.id)}
              followed={followedIds.has(u.id)}
              onOpenProfile={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
              onFollow={() => handleFollow(u)}
            />
          ))}
        </SuggestionsCarousel>
      )}
    </>
  );

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <ProfileSectionSurface flush style={surfaceStyle}>
        {body}
      </ProfileSectionSurface>
    </Animated.View>
  );
}

export function FeedSuggestionsLoadingRow() {
  return (
    <ProfileSectionSurface flush style={styles.surface}>
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

const styles = StyleSheet.create({
  surface: {
    marginBottom: 10,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 0,
  },
  surfaceInline: {
    marginBottom: 8,
    marginTop: 4,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: SECTION_INSET,
    marginBottom: 10,
    gap: 10,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  seeAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  seeAllText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  dismissBtn: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.65)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  dismissText: {
    color: AUTH.muted,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "400",
  },
  carousel: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    paddingHorizontal: SECTION_INSET,
  },
  listColumn: {
    paddingHorizontal: SECTION_INSET,
    gap: 10,
  },
  listCardWrap: {
    alignSelf: "stretch",
  },
  cardFullWidth: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 142,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    backgroundColor: "rgba(14, 14, 16, 0.95)",
    overflow: "hidden",
  },
  cardAccent: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(212, 175, 55, 0.55)",
  },
  cardBody: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  cardProfile: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 0,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(212, 175, 55, 0.06)",
    marginBottom: 6,
  },
  activeDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    borderWidth: 1.5,
    borderColor: "#0e0e10",
  },
  mutualRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 2,
    marginBottom: 2,
  },
  mutualAvatarWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    overflow: "hidden",
  },
  identity: {
    width: "100%",
    alignItems: "center",
    gap: 2,
    marginBottom: 6,
  },
  name: {
    color: AUTH.neutral100,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
  },
  hint: {
    color: AUTH.muted,
    fontSize: 9,
    lineHeight: 13,
    textAlign: "center",
    width: "100%",
  },
  followBtn: {
    alignSelf: "stretch",
    width: "100%",
    minWidth: 0,
    minHeight: 28,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  followText: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.88,
  },
  titleSkeleton: {
    width: 160,
    height: 14,
    borderRadius: 4,
    backgroundColor: "rgba(82, 82, 82, 0.35)",
  },
  subtitleSkeleton: {
    width: 120,
    height: 10,
    borderRadius: 4,
    backgroundColor: "rgba(82, 82, 82, 0.28)",
  },
});
