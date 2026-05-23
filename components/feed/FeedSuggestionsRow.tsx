import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { toggleFollow } from "../../api/auth";
import type { DiscoverUser } from "../../types/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { goiToast } from "../../context/GoiToastContext";
import { ProfileSectionSurface } from "../profile/ProfileSectionSurface";
import { UserAvatar } from "../ui/UserAvatar";

type FeedSuggestionsRowProps = {
  users: DiscoverUser[];
  followingIds: string[];
  currentUserId: string | undefined;
  loading?: boolean;
  dismissed?: boolean;
  onDismiss?: () => void;
  onFollowingChanged: (targetId: string, following: boolean) => void;
};

export function FeedSuggestionsRow({
  users,
  followingIds,
  currentUserId,
  loading,
  dismissed,
  onDismiss,
  onFollowingChanged,
}: FeedSuggestionsRowProps) {
  const router = useRouter();
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  const suggestions = users
    .filter((u) => u.id !== currentUserId && !followingIds.includes(u.id))
    .slice(0, 8);

  const handleFollow = useCallback(
    (u: DiscoverUser) => {
      if (pendingIds.has(u.id)) return;
      setPendingIds((prev) => new Set(prev).add(u.id));
      void toggleFollow(u.id)
        .then(({ following }) => {
          onFollowingChanged(u.id, following);
          goiToast(following ? `Sigues a @${u.username}` : `Dejaste de seguir a @${u.username}`);
        })
        .finally(() => {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(u.id);
            return next;
          });
        });
    },
    [onFollowingChanged, pendingIds]
  );

  if (dismissed) return null;

  if (loading) {
    return (
      <ProfileSectionSurface style={styles.surface}>
        <ActivityIndicator color={AUTH.gold} style={styles.loader} />
      </ProfileSectionSurface>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <ProfileSectionSurface style={styles.surface}>
      <View style={styles.headRow}>
        <Text style={styles.kicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Gente que podrías seguir
        </Text>
        {onDismiss ? (
          <Pressable
            onPress={onDismiss}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Ocultar sugerencias"
            style={({ pressed }) => [styles.dismissBtn, pressed ? styles.pressed : null]}
          >
            <Text style={styles.dismissText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              ×
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {suggestions.map((u) => {
          const pending = pendingIds.has(u.id);
          return (
            <View key={u.id} style={styles.card}>
              <Pressable
                onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
                style={({ pressed }) => [styles.avatarHit, pressed ? styles.pressed : null]}
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${u.username}`}
              >
                <UserAvatar src={u.avatarUrl} username={u.username} size={52} />
              </Pressable>
              <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                @{u.username}
              </Text>
              <Pressable
                onPress={() => handleFollow(u)}
                disabled={pending}
                style={({ pressed }) => [styles.followBtn, pressed ? styles.pressed : null]}
                accessibilityRole="button"
                accessibilityLabel={`Seguir a ${u.username}`}
              >
                {pending ? (
                  <ActivityIndicator size="small" color="#0a0a0a" />
                ) : (
                  <Text style={styles.followText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Seguir
                  </Text>
                )}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </ProfileSectionSurface>
  );
}

const styles = StyleSheet.create({
  surface: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  loader: {
    marginVertical: 8,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  kicker: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flex: 1,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.9)",
  },
  dismissText: {
    color: AUTH.muted,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "400",
    marginTop: -2,
  },
  strip: {
    gap: 10,
    paddingHorizontal: 8,
    paddingRight: 12,
  },
  card: {
    width: 112,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.75)",
    backgroundColor: "rgba(14, 14, 16, 0.92)",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarHit: {
    borderRadius: 26,
  },
  name: {
    color: AUTH.steel,
    fontSize: 12,
    fontWeight: "600",
    maxWidth: "100%",
  },
  followBtn: {
    minWidth: 80,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: AUTH.gold,
    alignItems: "center",
  },
  followText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
