import type { FeedScope } from "../constants/feed";
import {
  FEED_SUGGESTIONS_FOLLOWING_THRESHOLD,
  FEED_SUGGESTIONS_NEW_ACCOUNT_DAYS,
  FEED_SUGGESTIONS_SPARSE_FEED_MAX_POSTS,
} from "../constants/feedSuggestions";
import type { SuggestionsDismissState } from "./feedLocalPrefs";
import { isSuggestionsDismissed } from "./feedLocalPrefs";

export type FeedSuggestionsPlacement = "inline" | "header" | "empty" | "none";

export function shouldOfferFeedSuggestions(input: {
  dismiss: SuggestionsDismissState;
  availableCount: number;
  followingCount: number;
  accountCreatedAt?: string;
  feedScope: FeedScope;
  filteredPostsCount: number;
}): boolean {
  if (input.availableCount <= 0) return false;
  if (isSuggestionsDismissed(input.dismiss)) return false;

  const { followingCount, accountCreatedAt, feedScope, filteredPostsCount } = input;

  if (followingCount < FEED_SUGGESTIONS_FOLLOWING_THRESHOLD) return true;

  if (accountCreatedAt) {
    const ageMs = Date.now() - new Date(accountCreatedAt).getTime();
    const maxAgeMs = FEED_SUGGESTIONS_NEW_ACCOUNT_DAYS * 24 * 60 * 60 * 1000;
    if (ageMs >= 0 && ageMs < maxAgeMs) return true;
  }

  if (feedScope === "following" && filteredPostsCount <= FEED_SUGGESTIONS_SPARSE_FEED_MAX_POSTS) {
    return true;
  }

  return false;
}

export function feedSuggestionsPlacement(input: {
  shouldOffer: boolean;
  filteredPostsCount: number;
  feedScope: FeedScope;
}): FeedSuggestionsPlacement {
  if (!input.shouldOffer) return "none";

  if (input.filteredPostsCount === 0) {
    return input.feedScope === "following" ? "empty" : "header";
  }

  if (input.filteredPostsCount >= 3) return "inline";

  return "header";
}
