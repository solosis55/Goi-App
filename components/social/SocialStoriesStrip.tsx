import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getStories } from "../../api/stories";
import { camaraHistoriaHref } from "../../constants/storyRoutes";
import { useAuth } from "../../context/AuthContext";
import type { FeedStoryAuthor } from "../../types/story";
import { buildStoryStripAuthors, storyViewerAuthors } from "../../utils/storyStripAuthors";
import { FeedStoriesSection } from "../feed/FeedStoriesSection";
import { StoryViewerModal } from "../stories/StoryViewerModal";

export function SocialStoriesStrip() {
  const router = useRouter();
  const { user } = useAuth();
  const [authorsFromApi, setAuthorsFromApi] = useState<FeedStoryAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [seenRevision, setSeenRevision] = useState(0);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerAuthorIdx, setStoryViewerAuthorIdx] = useState(0);
  const [storyViewerSlideIdx, setStoryViewerSlideIdx] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await getStories();
      setAuthorsFromApi(data.authors ?? []);
    } catch {
      setAuthorsFromApi([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const storyStripAuthors = useMemo(() => {
    if (!user) return [];
    return buildStoryStripAuthors(authorsFromApi, {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    });
  }, [authorsFromApi, user]);

  const storyViewerList = useMemo(() => storyViewerAuthors(storyStripAuthors), [storyStripAuthors]);

  const handleStoryCellClick = useCallback(
    (clickedUserId: string) => {
      if (!user) return;
      const row = storyStripAuthors.find((a) => a.userId === clickedUserId);
      if (!row) return;
      if (clickedUserId === user.id && row.slides.length === 0) {
        router.push(camaraHistoriaHref());
        return;
      }
      const idx = storyViewerList.findIndex((a) => a.userId === clickedUserId);
      if (idx === -1) return;
      setStoryViewerAuthorIdx(idx);
      setStoryViewerSlideIdx(0);
      setStoryViewerOpen(true);
    },
    [router, storyStripAuthors, storyViewerList, user]
  );

  if (!user) return null;
  if (loading) return <ActivityIndicator color="#d4af37" style={{ marginVertical: 8 }} />;

  return (
    <View>
      <FeedStoriesSection
        authors={storyStripAuthors}
        currentUserId={user.id}
        seenRevision={seenRevision}
        onSelectAuthor={handleStoryCellClick}
      />
      <StoryViewerModal
        visible={storyViewerOpen}
        authors={storyViewerList}
        startAuthorIdx={storyViewerAuthorIdx}
        startSlideIdx={storyViewerSlideIdx}
        onClose={() => setStoryViewerOpen(false)}
        onStoriesUiRefresh={() => setSeenRevision((n) => n + 1)}
      />
    </View>
  );
}
