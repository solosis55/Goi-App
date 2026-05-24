import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { getPendingFollowRequests } from "../../api/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FollowRequestPreview } from "../../types/publicProfile";
import { FollowRequestsList } from "../social/FollowRequestsList";

type ProfileFollowRequestsSectionProps = {
  active: boolean;
};

export function ProfileFollowRequestsSection({ active }: ProfileFollowRequestsSectionProps) {
  const [requests, setRequests] = useState<FollowRequestPreview[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingFollowRequests();
      setRequests(res.requests ?? []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    void load();
  }, [active, load]);

  if (!active || (!loading && requests.length === 0)) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Solicitudes de seguimiento
      </Text>
      {loading && requests.length === 0 ? (
        <ActivityIndicator color={AUTH.gold} style={styles.loader} />
      ) : null}
      <FollowRequestsList requests={requests} onChanged={load} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    gap: 8,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "700",
  },
  loader: {
    marginVertical: 8,
  },
});
