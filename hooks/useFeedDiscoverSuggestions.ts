import { useCallback, useMemo, useRef, useState } from "react";
import { getDiscover } from "../api/auth";
import type { FeedScope } from "../constants/feed";
import { useFeedPrefsStore } from "../stores/useFeedPrefsStore";
import { useSocialHubStore } from "../stores/useSocialHubStore";
import type { DiscoverUser, SafeUser } from "../types/auth";
import {
  feedSuggestionsPlacement,
  shouldOfferFeedSuggestions,
} from "../utils/feedSuggestionsVisibility";

export function useFeedDiscoverSuggestions(
  user: SafeUser | null | undefined,
  feedScope: FeedScope,
  postCount: number
) {
  const suggestionsDismiss = useFeedPrefsStore((s) => s.suggestionsDismiss);
  const snoozeSuggestions = useFeedPrefsStore((s) => s.snoozeSuggestions);
  const dismissSuggestionsPermanent = useFeedPrefsStore((s) => s.dismissSuggestionsPermanent);
  const followingIds = useSocialHubStore((s) => s.followingIds);
  const applyFollowingChange = useSocialHubStore((s) => s.applyFollowingChange);

  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const discoverUsersRef = useRef<DiscoverUser[]>([]);
  discoverUsersRef.current = discoverUsers;

  const refreshDiscover = useCallback(async () => {
    if (!user?.id) {
      setDiscoverUsers([]);
      return;
    }
    const showLoading = discoverUsersRef.current.length === 0;
    if (showLoading) setDiscoverLoading(true);
    try {
      const res = await getDiscover(24);
      setDiscoverUsers(res.users ?? []);
    } catch {
      if (discoverUsersRef.current.length === 0) setDiscoverUsers([]);
    } finally {
      if (showLoading) setDiscoverLoading(false);
    }
  }, [user?.id]);

  const availableSuggestions = useMemo(
    () => discoverUsers.filter((u) => u.id !== user?.id && !followingIds.includes(u.id)),
    [discoverUsers, user?.id, followingIds]
  );

  const shouldOfferSuggestions = useMemo(
    () =>
      shouldOfferFeedSuggestions({
        dismiss: suggestionsDismiss,
        availableCount: availableSuggestions.length,
        followingCount: followingIds.length,
        accountCreatedAt: user?.createdAt,
        feedScope,
        filteredPostsCount: postCount,
      }),
    [
      suggestionsDismiss,
      availableSuggestions.length,
      followingIds.length,
      user?.createdAt,
      feedScope,
      postCount,
    ]
  );

  const suggestionsPlacement = useMemo(
    () =>
      feedSuggestionsPlacement({
        shouldOffer: shouldOfferSuggestions,
        filteredPostsCount: postCount,
      }),
    [shouldOfferSuggestions, postCount]
  );

  const handleSnoozeSuggestions = useCallback(() => {
    if (!user?.id) return;
    void snoozeSuggestions(user.id);
  }, [user?.id, snoozeSuggestions]);

  const handleDismissSuggestionsPermanent = useCallback(() => {
    if (!user?.id) return;
    void dismissSuggestionsPermanent(user.id);
  }, [user?.id, dismissSuggestionsPermanent]);

  const suggestionsRowProps = useMemo(
    () => ({
      users: discoverUsers,
      followingIds,
      currentUserId: user?.id,
      feedScope,
      loading: discoverLoading,
      onSnooze: handleSnoozeSuggestions,
      onDismissPermanent: handleDismissSuggestionsPermanent,
      onFollowingChanged: (targetId: string, following: boolean) => {
        applyFollowingChange(targetId, following);
      },
      showManageInSocial: true,
    }),
    [
      discoverUsers,
      followingIds,
      user?.id,
      feedScope,
      discoverLoading,
      handleSnoozeSuggestions,
      handleDismissSuggestionsPermanent,
      applyFollowingChange,
    ]
  );

  return {
    suggestionsPlacement,
    shouldOfferSuggestions,
    insertSuggestionsInline: suggestionsPlacement === "inline",
    showSuggestionsInEmpty: suggestionsPlacement === "empty",
    availableSuggestionsCount: availableSuggestions.length,
    suggestionsRowProps,
    refreshDiscover,
  };
}
