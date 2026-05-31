import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { toggleFollow } from "../../api/auth";
import type { DiscoverUser } from "../../types/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { profileFollowButtonStyles as followStyles } from "../profile/profileFollowButtonStyles";
import { UserAvatar } from "../ui/UserAvatar";

type HighlightStripProps = {
  title: string;
  subtitle: string;
  users: DiscoverUser[];
  followingIds: string[];
  onFollowingChanged: (targetId: string, following: boolean) => void;
};

function HighlightStrip({ title, subtitle, users, followingIds, onFollowingChanged }: HighlightStripProps) {
  const router = useRouter();
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  const handleFollow = useCallback(
    (u: DiscoverUser) => {
      if (pendingIds.has(u.id) || followingIds.includes(u.id)) return;
      setPendingIds((prev) => new Set(prev).add(u.id));
      void toggleFollow(u.id)
        .then(({ following }) => onFollowingChanged(u.id, following))
        .finally(() => {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(u.id);
            return next;
          });
        });
    },
    [followingIds, onFollowingChanged, pendingIds]
  );

  if (users.length === 0) return null;

  return (
    <View style={styles.strip}>
      <Text style={styles.stripTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>
      <Text style={styles.stripSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {subtitle}
      </Text>
      <View style={styles.listBlock}>
        {users.map((u, index) => {
          const followed = followingIds.includes(u.id);
          const pending = pendingIds.has(u.id);
          const meta =
            (u.mutualCount ?? 0) > 0
              ? `${u.mutualCount} en común`
              : u.activeThisWeek
                ? "Activo esta semana"
                : u.reason?.trim() || "Perfil en GoI";
          return (
            <View
              key={u.id}
              style={[styles.listRow, index < users.length - 1 ? styles.listRowDivider : null]}
            >
              <Pressable
                onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
                style={({ pressed }) => [styles.listRowMain, pressed ? styles.pressed : null]}
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${u.username}`}
              >
                <UserAvatar src={u.avatarUrl} username={u.username} size={40} />
                <View style={styles.listMeta}>
                  <Text style={styles.listName} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    @{u.username}
                  </Text>
                  <Text style={styles.listHint} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {meta}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => handleFollow(u)}
                disabled={pending || followed}
                style={({ pressed }) => [
                  followStyles.base,
                  followed ? followStyles.following : followStyles.primary,
                  styles.listFollowBtn,
                  pressed ? followStyles.pressed : null,
                  pending ? followStyles.busy : null,
                ]}
              >
                {pending ? (
                  <ActivityIndicator size="small" color="#0a0a0a" />
                ) : (
                  <Text
                    style={[
                      followed ? followStyles.textFollowing : followStyles.textPrimary,
                      styles.listFollowText,
                    ]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    {followed ? "Siguiendo" : "Seguir"}
                  </Text>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type SocialDiscoverHighlightsProps = {
  mutuals: DiscoverUser[];
  activeThisWeek: DiscoverUser[];
  followingIds: string[];
  onFollowingChanged: (targetId: string, following: boolean) => void;
};

export function SocialDiscoverHighlights({
  mutuals,
  activeThisWeek,
  followingIds,
  onFollowingChanged,
}: SocialDiscoverHighlightsProps) {
  if (mutuals.length === 0 && activeThisWeek.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <HighlightStrip
        title="En común contigo"
        subtitle="Compartís seguidores"
        users={mutuals}
        followingIds={followingIds}
        onFollowingChanged={onFollowingChanged}
      />
      <HighlightStrip
        title="Entrenaron esta semana"
        subtitle="Publicaron o registraron sesión recientemente"
        users={activeThisWeek}
        followingIds={followingIds}
        onFollowingChanged={onFollowingChanged}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  strip: {
    gap: 6,
  },
  stripTitle: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "700",
  },
  stripSubtitle: {
    color: AUTH.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  listBlock: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    backgroundColor: "rgba(14, 14, 16, 0.6)",
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  listRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  listRowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  listMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  listName: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "700",
  },
  listHint: {
    color: AUTH.muted,
    fontSize: 12,
  },
  listFollowBtn: {
    alignSelf: "center",
    minWidth: 84,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  listFollowText: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.88,
  },
});
