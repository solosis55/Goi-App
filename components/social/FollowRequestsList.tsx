import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { respondFollowRequest } from "../../api/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FollowRequestPreview } from "../../types/publicProfile";
import { UserAvatar } from "../ui/UserAvatar";

type FollowRequestsListProps = {
  requests: FollowRequestPreview[];
  loading?: boolean;
  onChanged?: () => void;
};

export function FollowRequestsList({ requests, loading, onChanged }: FollowRequestsListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handle = useCallback(
    async (requesterId: string, action: "accept" | "reject") => {
      setBusyId(requesterId);
      try {
        await respondFollowRequest(requesterId, action);
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
        <View key={r.requesterId} style={styles.row}>
          <UserAvatar src={r.avatarUrl} username={r.username} size={40} />
          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{r.username}
            </Text>
            <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Quiere seguirte
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={() => void handle(r.requesterId, "reject")}
              disabled={busyId === r.requesterId}
              style={({ pressed }) => [styles.rejectBtn, pressed ? styles.pressed : null]}
            >
              <Text style={styles.rejectText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Rechazar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void handle(r.requesterId, "accept")}
              disabled={busyId === r.requesterId}
              style={({ pressed }) => [styles.acceptBtn, pressed ? styles.pressed : null]}
            >
              <Text style={styles.acceptText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Aceptar
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  loader: {
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(82, 82, 82, 0.35)",
  },
  meta: {
    flex: 1,
    gap: 2,
    minWidth: 0,
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
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  rejectBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.65)",
  },
  rejectText: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  acceptBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: AUTH.gold,
  },
  acceptText: {
    color: "#0a0a0a",
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
