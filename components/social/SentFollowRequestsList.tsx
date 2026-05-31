import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { toggleFollow } from "../../api/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { SentFollowRequestPreview } from "../../types/publicProfile";
import { UserAvatar } from "../ui/UserAvatar";

type SentFollowRequestsListProps = {
  requests: SentFollowRequestPreview[];
  loading?: boolean;
  onChanged?: () => void;
};

export function SentFollowRequestsList({ requests, loading, onChanged }: SentFollowRequestsListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const cancel = useCallback(
    async (targetUserId: string) => {
      setBusyId(targetUserId);
      try {
        await toggleFollow(targetUserId);
        onChanged?.();
      } finally {
        setBusyId(null);
      }
    },
    [onChanged]
  );

  if (!loading && requests.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {loading ? <ActivityIndicator color={AUTH.gold} style={styles.loader} /> : null}
      {requests.map((r) => (
        <View key={r.targetUserId} style={styles.row}>
          <Pressable
            onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: r.targetUserId } })}
            style={({ pressed }) => [styles.profileTap, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Ver perfil de ${r.username}`}
          >
            <UserAvatar src={r.avatarUrl} username={r.username} size={40} />
            <View style={styles.meta}>
              <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                @{r.username}
              </Text>
              <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Esperando respuesta
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => void cancel(r.targetUserId)}
            disabled={busyId === r.targetUserId}
            style={({ pressed }) => [styles.cancelBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Cancelar solicitud a ${r.username}`}
          >
            <Text style={styles.cancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cancelar
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  loader: {
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileTap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    color: AUTH.muted,
    fontSize: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.8)",
  },
  cancelText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
