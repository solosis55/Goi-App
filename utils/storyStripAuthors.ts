import type { FeedStoryAuthor } from "../types/story";

type Viewer = { id: string; username: string; avatarUrl?: string | null };

/** Misma fila que el feed: tu Daily primero, luego el resto (tamaños alineados en StoriesRow). */
export function buildStoryStripAuthors(
  authorsFromApi: FeedStoryAuthor[],
  viewer: Viewer
): FeedStoryAuthor[] {
  const withoutSelf = authorsFromApi.filter((a) => a.userId !== viewer.id);
  const mine = authorsFromApi.find((a) => a.userId === viewer.id);
  const selfRow: FeedStoryAuthor =
    mine ?? {
      userId: viewer.id,
      authorUsername: viewer.username,
      authorAvatarUrl: viewer.avatarUrl ?? "",
      slides: [],
    };
  return [selfRow, ...withoutSelf];
}

export function storyViewerAuthors(stripAuthors: FeedStoryAuthor[]): FeedStoryAuthor[] {
  return stripAuthors.filter((a) => a.slides.length > 0);
}
