import type { PublicProfileSession } from "../types/publicProfile";
import type { ProfileLastSession } from "../hooks/useProfileStats";
import { computeWorkoutStreakWeeks } from "./workoutStreak";
import { countSessionsInRollingWeek } from "./workoutSessionStats";

export function computeProfileStatsFromSessions(
  sessions: PublicProfileSession[],
  workoutTitles: Record<string, string>,
  routinesCount: number
) {
  const userSessions = [...sessions];
  const totalSessions = userSessions.length;
  const sessionsThisWeek = countSessionsInRollingWeek(userSessions);
  const streakWeeks = computeWorkoutStreakWeeks(
    userSessions.map((s) => Date.parse(s.performedAt)).filter(Number.isFinite)
  );

  const sorted = [...userSessions].sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1));
  const latest = sorted[0];
  const lastSession: ProfileLastSession | null = latest
    ? {
        performedAt: latest.performedAt,
        workoutTitle: workoutTitles[latest.workoutId] ?? latest.workoutTitle ?? "Rutina",
      }
    : null;

  const seen = new Set<string>();
  const recentRoutineTitles: string[] = [];
  for (const s of sorted) {
    if (!s.workoutId || seen.has(s.workoutId)) continue;
    seen.add(s.workoutId);
    recentRoutineTitles.push(workoutTitles[s.workoutId] ?? s.workoutTitle ?? "Rutina");
    if (recentRoutineTitles.length >= 3) break;
  }

  return {
    totalSessions,
    sessionsThisWeek,
    routinesCount,
    lastSession,
    recentRoutineTitles,
    streakWeeks,
  };
}
