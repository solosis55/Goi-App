import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getBlockedUsersPreviews, toggleBlockUser } from "../../api/auth";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { confirmUnblock } from "../../utils/socialConfirmActions";
import type { DiscoverUser } from "../../types/auth";
import { minimalDiscoverUser } from "../../utils/socialUserMappers";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { UserAvatar } from "../ui/UserAvatar";

type SocialBlockedListProps = {
  onChanged?: () => void;
};

export function SocialBlockedList({ onChanged }: SocialBlockedListProps) {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBlockedUsersPreviews();
      setUsers(
        (res.users ?? []).map((u) =>
          minimalDiscoverUser({
            id: u.id,
            username: u.username,
            avatarUrl: u.avatarUrl,
            isFollowing: false,
          })
        )
      );
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!loading && users.length === 0) return null;

  if (loading) return <ActivityIndicator color={AUTH.gold} style={styles.loader} />;

  return (
    <View style={styles.wrap}>
      {users.map((u, index) => (
        <View key={u.id} style={[styles.row, index < users.length - 1 ? styles.divider : null]}>
          <Pressable
            onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
            style={({ pressed }) => [styles.main, pressed ? styles.pressed : null]}
          >
            <UserAvatar src={u.avatarUrl} username={u.username} size={36} />
            <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{u.username}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              confirmUnblock(showAlert, u.username, () => {
                setBusyId(u.id);
                void toggleBlockUser(u.id)
                  .then(() => onChanged?.())
                  .finally(() => setBusyId(null));
              });
            }}
            disabled={busyId === u.id}
            style={({ pressed }) => [styles.unblock, pressed ? styles.pressed : null]}
          >
            <Text style={styles.unblockText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Desbloquear
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginVertical: 8 },
  wrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.5)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  name: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  unblock: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  unblockText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
