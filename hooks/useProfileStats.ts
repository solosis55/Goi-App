import { useCallback, useState } from "react";
import { getProfileStats } from "../api/auth";
import { useFocusStaleRefresh } from "./useFocusStaleRefresh";

export type ProfileLastSession = {
  performedAt: string;
  workoutTitle: string;
};

const PROFILE_STATS_STALE_MS = 30_000;

export function useProfileStats(userId: string | undefined) {
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [routinesCount, setRoutinesCount] = useState<number | null>(null);
  const [totalSessions, setTotalSessions] = useState<number | null>(null);
  const [sessionsThisWeek, setSessionsThisWeek] = useState<number | null>(null);
  const [lastSession, setLastSession] = useState<ProfileLastSession | null>(null);
  const [recentRoutineTitles, setRecentRoutineTitles] = useState<string[]>([]);
  const [streakWeeks, setStreakWeeks] = useState(0);
  const [sparklineCounts, setSparklineCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const stats = await getProfileStats(userId);
      setFollowersCount(stats.followersCount);
      setFollowingCount(stats.followingCount);
      setRoutinesCount(stats.routinesCount);
      setTotalSessions(stats.totalSessions);
      setSessionsThisWeek(stats.sessionsThisWeek);
      setLastSession(
        stats.lastSession
          ? {
              performedAt: stats.lastSession.performedAt,
              workoutTitle: stats.lastSession.workoutTitle,
            }
          : null
      );
      setRecentRoutineTitles(stats.recentRoutineTitles);
      setStreakWeeks(stats.streakWeeks);
      setSparklineCounts(stats.sparklineCounts);
    } catch {
      setFollowersCount(null);
      setFollowingCount(null);
      setRoutinesCount(null);
      setTotalSessions(null);
      setSessionsThisWeek(null);
      setLastSession(null);
      setRecentRoutineTitles([]);
      setStreakWeeks(0);
      setSparklineCounts([0, 0, 0, 0, 0, 0, 0]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusStaleRefresh({
    enabled: !!userId,
    staleMs: PROFILE_STATS_STALE_MS,
    hasData: () => followersCount != null,
    onRefresh: () => load(),
  });

  const refresh = useCallback(() => {
    void load();
  }, [load]);

  return {
    followersCount,
    followingCount,
    routinesCount,
    totalSessions,
    sessionsThisWeek,
    lastSession,
    recentRoutineTitles,
    streakWeeks,
    sparklineCounts,
    loading,
    refresh,
  };
}
