export type FeedContentFilter = "all" | "photos" | "workout";

export const FEED_CONTENT_FILTERS: { id: FeedContentFilter; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "photos", label: "Con foto" },
  { id: "workout", label: "Con rutina" },
];
