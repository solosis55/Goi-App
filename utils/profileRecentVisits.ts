import AsyncStorage from "@react-native-async-storage/async-storage";
import { RECENT_PROFILE_VISITS_KEY } from "../constants/storageKeys";

export type RecentProfileVisit = {
  userId: string;
  username: string;
  avatarUrl: string;
  visitedAt: string;
};

const MAX_VISITS = 12;

export async function readRecentProfileVisits(viewerId: string): Promise<RecentProfileVisit[]> {
  try {
    const raw = await AsyncStorage.getItem(`${RECENT_PROFILE_VISITS_KEY}:${viewerId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentProfileVisit[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordRecentProfileVisit(
  viewerId: string,
  visit: Omit<RecentProfileVisit, "visitedAt">
): Promise<void> {
  const list = await readRecentProfileVisits(viewerId);
  const next: RecentProfileVisit[] = [
    { ...visit, visitedAt: new Date().toISOString() },
    ...list.filter((v) => v.userId !== visit.userId),
  ].slice(0, MAX_VISITS);
  await AsyncStorage.setItem(`${RECENT_PROFILE_VISITS_KEY}:${viewerId}`, JSON.stringify(next));
}
