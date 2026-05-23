import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { getFollowers, getFollowing } from "../api/auth";
import { getWorkouts } from "../api/workouts";

export function useProfileStats(userId: string | undefined) {
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [routinesCount, setRoutinesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [followersRes, followingRes, workoutsRes] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
        getWorkouts().catch(() => [] as Awaited<ReturnType<typeof getWorkouts>>),
      ]);
      setFollowersCount(followersRes.followerIds?.length ?? 0);
      setFollowingCount(followingRes.followingIds?.length ?? 0);
      setRoutinesCount(workoutsRes.filter((w) => w.userId === userId).length);
    } catch {
      setFollowersCount(null);
      setFollowingCount(null);
      setRoutinesCount(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return { followersCount, followingCount, routinesCount, loading, refresh: load };
}
