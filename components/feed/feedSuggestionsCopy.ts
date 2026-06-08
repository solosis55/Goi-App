import type { FeedScope } from "../../constants/feed";

export type FeedSuggestionsVariant = "inline" | "header" | "empty" | "list";

export function feedSuggestionsHeaderCopy(
  scope: FeedScope | undefined,
  variant: FeedSuggestionsVariant
): { title: string; subtitle: string } {
  if (scope === "following" || variant === "empty") {
    return {
      title: "Para llenar tu feed",
      subtitle: "Sigue atletas y verás sus publicaciones aquí",
    };
  }
  if (variant === "inline") {
    return {
      title: "Amplía tu círculo",
      subtitle: "Atletas que encajan contigo",
    };
  }
  return {
    title: "Gente que podrías seguir",
    subtitle: "Descubre atletas en la comunidad",
  };
}
