import type { FeedNotification } from "../types/post";

export type NotificationFilter = "all" | "like" | "comment" | "follow";

export const NOTIFICATION_FILTER_OPTIONS: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "like", label: "Me gusta" },
  { id: "comment", label: "Comentarios" },
  { id: "follow", label: "Seguidores" },
];

export function filterNotifications(
  items: FeedNotification[],
  filter: NotificationFilter
): FeedNotification[] {
  if (filter === "all") return items;
  return items.filter((n) => n.type === filter);
}
