import { useCallback, useMemo, type ComponentProps } from "react";
import { RefreshControl, StyleSheet, View, type ViewabilityConfigCallbackPairs } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH } from "../../constants/authUi";
import type { FeedScope } from "../../constants/feed";
import {
  FeedPostActionsProvider,
  type FeedPostActionsHandlers,
} from "../../context/FeedPostActionsContext";
import { FeedGoldBeamProvider } from "../../context/FeedGoldBeamContext";
import type { SafeUser } from "../../types/auth";
import type { Post } from "../../types/post";
import type { FeedStoryAuthor } from "../../types/story";
import { postEligibleForGoldBeam } from "../../utils/feedTimeline";
import type { FeedSuggestionsPlacement } from "../../utils/feedSuggestionsVisibility";
import type { FeedListItem } from "../../utils/feedListItems";
import { AppScreenShell } from "../AppScreenShell";
import { FeedAnimatedFlashList, type FeedAnimatedFlashListRef } from "./FeedAnimatedFlashList";
import { FeedDaySeparator } from "./FeedDaySeparator";
import { FeedDiscoveryZone } from "./FeedDiscoveryZone";
import { FeedEmptyState } from "./FeedEmptyState";
import { FeedErrorBanner } from "./FeedErrorBanner";
import { FeedInlineSuggestionsRow, FeedSuggestionsRow } from "./FeedSuggestionsRow";
import { FeedLoadMoreFooter } from "./FeedLoadMoreFooter";
import { FeedNewPostsBanner } from "./FeedNewPostsBanner";
import { FeedPostCardRow } from "./FeedPostCardRow";
import { FeedPostCardSkeleton } from "./FeedPostCardSkeleton";
import { FeedScrollToTopFab } from "./FeedScrollToTopFab";
import { FeedStickyScopeHeader } from "./FeedStickyScopeHeader";
import { FeedTopBar } from "./FeedTopBar";
import { FeedWorkoutEventRow } from "./FeedWorkoutEventRow";

const FEED_MAX_WIDTH = 672;
const LIST_BOTTOM_PAD = 24;

function FeedListSeparator() {
  return <View style={styles.listGap} />;
}

export type FeedScreenContentProps = {
  user: SafeUser;
  listRef: React.RefObject<FeedAnimatedFlashListRef | null>;
  scrollY: SharedValue<number>;
  goldBeamEnabled: boolean;
  activeBeamPostId: string | null;
  beamViewabilityPairs: ViewabilityConfigCallbackPairs;
  onListScroll: ReturnType<typeof import("react-native-reanimated").useAnimatedScrollHandler>;
  showScrollFab: boolean;
  scrollFeedToTop: () => void;
  unreadNotifications: number;
  onNotificationsPress: () => void;
  pendingNewCount: number;
  onNewPostsBanner: () => void;
  feedListItems: FeedListItem[];
  feedListExtraKey: string;
  feedScope: FeedScope;
  feedScopeReady: boolean;
  setFeedScopePersisted: (scope: FeedScope) => void;
  showFollowingHint: boolean;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: { message?: string; detail?: string } | null;
  posts: Post[];
  postCount: number;
  hasMore: boolean;
  loadMore: () => void;
  fetchFeed: (
    mode: "initial" | "refresh",
    scope: FeedScope,
    opts?: { force?: boolean }
  ) => void;
  onPullRefresh: () => void;
  storyStripAuthors: FeedStoryAuthor[];
  storySeenRevision: number;
  onStoryCellClick: (userId: string) => void;
  shouldOfferSuggestions: boolean;
  suggestionsPlacement: FeedSuggestionsPlacement;
  showSuggestionsInEmpty: boolean;
  suggestionsRowProps: ComponentProps<typeof FeedInlineSuggestionsRow>;
  workoutTitles: Record<string, string>;
  highlightedPostId: string | null;
  focusPostId?: string;
  focusCommentId?: string;
  onOpenAuthor: (authorUserId: string) => void;
  postActionsHandlers: FeedPostActionsHandlers;
};

export function FeedScreenContent({
  user,
  listRef,
  scrollY,
  goldBeamEnabled,
  activeBeamPostId,
  beamViewabilityPairs,
  onListScroll,
  showScrollFab,
  scrollFeedToTop,
  unreadNotifications,
  onNotificationsPress,
  pendingNewCount,
  onNewPostsBanner,
  feedListItems,
  feedListExtraKey,
  feedScope,
  feedScopeReady,
  setFeedScopePersisted,
  showFollowingHint,
  loading,
  refreshing,
  loadingMore,
  error,
  posts,
  postCount,
  hasMore,
  loadMore,
  fetchFeed,
  onPullRefresh,
  storyStripAuthors,
  storySeenRevision,
  onStoryCellClick,
  shouldOfferSuggestions,
  suggestionsPlacement,
  showSuggestionsInEmpty,
  suggestionsRowProps,
  workoutTitles,
  highlightedPostId,
  focusPostId,
  focusCommentId,
  onOpenAuthor,
  postActionsHandlers,
}: FeedScreenContentProps) {
  const insets = useSafeAreaInsets();

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedListItem }) => {
      if (item.kind === "day") {
        return <FeedDaySeparator label={item.label} />;
      }
      if (item.kind === "suggestions") {
        return <FeedInlineSuggestionsRow {...suggestionsRowProps} />;
      }
      if (item.kind === "workout") {
        return <FeedWorkoutEventRow event={item.event} onOpenAuthor={onOpenAuthor} />;
      }
      const post = item.post;
      const openCommentsFromNotification =
        focusPostId === post.id && Boolean(focusCommentId);
      return (
        <View style={styles.postRowWrap}>
          <FeedPostCardRow
            post={post}
            currentUserId={user.id}
            sessionAvatarUrl={user.avatarUrl}
            isBeamActive={
              goldBeamEnabled && activeBeamPostId === post.id && postEligibleForGoldBeam(post)
            }
            initialCommentsOpen={openCommentsFromNotification}
            highlighted={highlightedPostId === post.id}
            workoutTitle={
              post.sessionWorkoutTitle ??
              (post.workoutId ? workoutTitles[post.workoutId] ?? "Rutina vinculada" : null)
            }
          />
        </View>
      );
    },
    [
      focusPostId,
      focusCommentId,
      user.id,
      user.avatarUrl,
      activeBeamPostId,
      goldBeamEnabled,
      highlightedPostId,
      workoutTitles,
      suggestionsRowProps,
      onOpenAuthor,
    ]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <FeedDiscoveryZone
          authors={storyStripAuthors}
          currentUserId={user.id}
          seenRevision={storySeenRevision}
          onSelectAuthor={onStoryCellClick}
          suggestionsPlacement={shouldOfferSuggestions ? suggestionsPlacement : "none"}
        />

        {feedScopeReady ? (
          <FeedStickyScopeHeader
            mode={feedScope}
            onChangeMode={setFeedScopePersisted}
            showFollowingHint={showFollowingHint}
          />
        ) : null}

        <FeedErrorBanner
          errorMessage={error?.message}
          errorDetail={error?.detail}
          onRetry={error ? () => void fetchFeed("initial", feedScope) : undefined}
        />

        {loading && posts.length === 0 ? <FeedPostCardSkeleton count={3} /> : null}
      </View>
    ),
    [
      storyStripAuthors,
      user.id,
      storySeenRevision,
      onStoryCellClick,
      shouldOfferSuggestions,
      suggestionsPlacement,
      feedScopeReady,
      feedScope,
      setFeedScopePersisted,
      showFollowingHint,
      error,
      fetchFeed,
      loading,
      posts.length,
    ]
  );

  const listFooter = useMemo(
    () => (
      <View>
        {!loading && !error && postCount === 0 ? (
          <FeedEmptyState
            scope={feedScope}
            suggestionsSlot={
              showSuggestionsInEmpty ? (
                <FeedSuggestionsRow {...suggestionsRowProps} variant="empty" />
              ) : undefined
            }
          />
        ) : null}
        <FeedLoadMoreFooter
          hasMore={hasMore && postCount > 0}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </View>
    ),
    [
      loading,
      error,
      postCount,
      feedScope,
      showSuggestionsInEmpty,
      suggestionsRowProps,
      hasMore,
      loadingMore,
      loadMore,
    ]
  );

  return (
    <AppScreenShell variant="feed">
      <FeedGoldBeamProvider scrollY={scrollY} enabled={goldBeamEnabled}>
        <View style={styles.screen}>
          <FeedTopBar
            user={user}
            onBrandPress={scrollFeedToTop}
            scrollY={scrollY}
            unreadCount={unreadNotifications}
            onNotificationsPress={onNotificationsPress}
          />
          <View style={[styles.newPostsBannerSlot, { top: Math.max(insets.top, 6) + 52 }]}>
            <FeedNewPostsBanner count={pendingNewCount} onPress={onNewPostsBanner} />
          </View>
          <FeedPostActionsProvider handlers={postActionsHandlers}>
            <FeedAnimatedFlashList
              ref={listRef}
              style={styles.list}
              data={feedListItems}
              keyExtractor={(item) => item.key}
              getItemType={(item) => (item.kind === "post" ? `post-${item.post.id}` : item.kind)}
              keyboardShouldPersistTaps="handled"
              drawDistance={720}
              viewabilityConfigCallbackPairs={beamViewabilityPairs}
              onScroll={onListScroll}
              scrollEventThrottle={16}
              onEndReached={loadMore}
              onEndReachedThreshold={0.4}
              extraData={feedListExtraKey}
              ItemSeparatorComponent={FeedListSeparator}
              renderItem={renderFeedItem}
              ListHeaderComponent={listHeader}
              ListFooterComponent={listFooter}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onPullRefresh}
                  tintColor={AUTH.gold}
                  colors={[AUTH.gold]}
                  progressBackgroundColor="#141416"
                />
              }
            />
          </FeedPostActionsProvider>
          <FeedScrollToTopFab visible={showScrollFab} onPress={scrollFeedToTop} />
        </View>
      </FeedGoldBeamProvider>
    </AppScreenShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  newPostsBannerSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 11,
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: LIST_BOTTOM_PAD,
    width: "100%",
    maxWidth: FEED_MAX_WIDTH,
    alignSelf: "center",
  },
  listGap: {
    height: 16,
  },
  postRowWrap: {
    overflow: "visible",
  },
  headerBlock: {
    width: "100%",
  },
});
