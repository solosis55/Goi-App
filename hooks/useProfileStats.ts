import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { getProfileStats } from "../api/auth";

export type ProfileLastSession = {
  performedAt: string;
  workoutTitle: string;
};

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
  const lastLoadAtRef = useRef(0);
  const STALE_MS = 30_000;

  const load = useCallback(
    async (opts?: { force?: boolean }) => {
      if (!userId) return;
      const now = Date.now();
      if (!opts?.force && now - lastLoadAtRef.current < STALE_MS && followersCount != null) {
        return;
      }
      setLoading(true);
      try {
        const stats = await getProfileStats(userId);
        lastLoadAtRef.current = Date.now();
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
    },
    [userId, followersCount]
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const refresh = useCallback(() => load({ force: true }), [load]);

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
