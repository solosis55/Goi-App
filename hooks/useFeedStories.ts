import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { getStories } from "../api/stories";
import { camaraHistoriaHref } from "../constants/storyRoutes";
import type { SafeUser } from "../types/auth";
import type { FeedStoryAuthor } from "../types/story";
import { buildStoryStripAuthors, storyViewerAuthors } from "../utils/storyStripAuthors";

export function useFeedStories(user: SafeUser | null | undefined) {
  const router = useRouter();
  const [storyAuthorsFromApi, setStoryAuthorsFromApi] = useState<FeedStoryAuthor[]>([]);
  const [storySeenRevision, setStorySeenRevision] = useState(0);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerAuthorIdx, setStoryViewerAuthorIdx] = useState(0);
  const [storyViewerSlideIdx, setStoryViewerSlideIdx] = useState(0);

  const storyStripAuthors = useMemo((): FeedStoryAuthor[] => {
    if (!user) return [];
    return buildStoryStripAuthors(storyAuthorsFromApi, {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    });
  }, [storyAuthorsFromApi, user]);

  const storyViewerAuthorsList = useMemo(
    () => storyViewerAuthors(storyStripAuthors),
    [storyStripAuthors]
  );

  const refreshStories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getStories();
      setStoryAuthorsFromApi(data.authors ?? []);
    } catch {
      /* no bloquea el feed */
    }
  }, [user]);

  const handleStoryCellClick = useCallback(
    (clickedUserId: string) => {
      if (!user) return;
      const row = storyStripAuthors.find((a) => a.userId === clickedUserId);
      if (!row) return;
      if (clickedUserId === user.id && row.slides.length === 0) {
        router.push(camaraHistoriaHref());
        return;
      }
      const idx = storyViewerAuthorsList.findIndex((a) => a.userId === clickedUserId);
      if (idx === -1) return;
      setStoryViewerAuthorIdx(idx);
      setStoryViewerSlideIdx(0);
      setStoryViewerOpen(true);
    },
    [router, storyStripAuthors, storyViewerAuthorsList, user]
  );

  return {
    storyStripAuthors,
    storyViewerAuthorsList,
    storySeenRevision,
    storyViewerOpen,
    storyViewerAuthorIdx,
    storyViewerSlideIdx,
    setStoryViewerOpen,
    bumpStorySeenRevision: () => setStorySeenRevision((n) => n + 1),
    refreshStories,
    handleStoryCellClick,
  };
}
