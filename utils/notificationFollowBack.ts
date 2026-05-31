import type { FeedNotification } from "../types/post";
import { isToday } from "./notificationDayGroups";

export function pickTodayFollowBackNotifications(
  items: FeedNotification[],
  followingIds: string[],
  currentUserId: string | undefined
): FeedNotification[] {
  const following = new Set(followingIds);
  const seen = new Set<string>();
  const out: FeedNotification[] = [];
  for (const n of items) {
    if (n.type !== "follow" || !isToday(n.createdAt)) continue;
    if (n.actorUserId === currentUserId || following.has(n.actorUserId)) continue;
    if (seen.has(n.actorUserId)) continue;
    seen.add(n.actorUserId);
    out.push(n);
  }
  return out;
}
