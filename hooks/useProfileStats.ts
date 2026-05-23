import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { getFollowers, getFollowing } from "../api/auth";
import { getWorkoutSessions } from "../api/workoutSessions";
import { getWorkouts } from "../api/workouts";
import { computeWorkoutStreakWeeks } from "../utils/workoutStreak";
import { sessionsPerDayLast7 } from "../utils/workoutWeekSparkline";
import { countSessionsInRollingWeek } from "../utils/workoutSessionStats";

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

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [followersRes, followingRes, workoutsRes, sessionsRes] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
        getWorkouts().catch(() => [] as Awaited<ReturnType<typeof getWorkouts>>),
        getWorkoutSessions().catch(() => [] as Awaited<ReturnType<typeof getWorkoutSessions>>),
      ]);
      setFollowersCount(followersRes.followerIds?.length ?? 0);
      setFollowingCount(followingRes.followingIds?.length ?? 0);
      setRoutinesCount(workoutsRes.filter((w) => w.userId === userId).length);
      const userSessions = sessionsRes.filter((s) => s.userId === userId);
      setTotalSessions(userSessions.length);
      setSessionsThisWeek(countSessionsInRollingWeek(userSessions));
      setSparklineCounts(sessionsPerDayLast7(userSessions));
      setStreakWeeks(
        computeWorkoutStreakWeeks(
          userSessions.map((s) => Date.parse(s.performedAt)).filter(Number.isFinite)
        )
      );
      const sorted = [...userSessions].sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1));
      const latest = sorted[0];
      setLastSession(
        latest
          ? {
              performedAt: latest.performedAt,
              workoutTitle:
                workoutsRes.find((w) => w.id === latest.workoutId)?.title ??
                latest.workoutTitle ??
                "Rutina",
            }
          : null
      );
      const seen = new Set<string>();
      const titles: string[] = [];
      for (const s of sorted) {
        if (!s.workoutId || seen.has(s.workoutId)) continue;
        seen.add(s.workoutId);
        titles.push(
          workoutsRes.find((w) => w.id === s.workoutId)?.title ?? s.workoutTitle ?? "Rutina"
        );
        if (titles.length >= 3) break;
      }
      setRecentRoutineTitles(titles);
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

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

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
    refresh: load,
  };
}
