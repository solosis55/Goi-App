import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocialHubStore } from "../stores/useSocialHubStore";
import type { Post } from "../types/post";
import type { MentionPickUser } from "../utils/mentionAutocomplete";
import {
  buildMentionPickList,
  mentionDirectoryFromCandidates,
} from "../utils/mentionCandidates";
import { useMentionRecents } from "./useMentionRecents";

type UseMentionCandidatesOpts = {
  extra?: MentionPickUser[];
  posts?: Post[];
};

/** Referencias estables para selectores Zustand (evita bucle infinito con `?? []`). */
const EMPTY_DISCOVER: { id: string; username: string; avatarUrl?: string }[] = [];
const EMPTY_PREVIEWS: { id: string; username: string; avatarUrl?: string }[] = [];

export function useMentionCandidates(opts: UseMentionCandidatesOpts = {}) {
  const { user } = useAuth();
  const followingIds = useSocialHubStore((s) => s.followingIds);
  const discoverUsers = useSocialHubStore((s) => s.hub?.discoverUsers ?? EMPTY_DISCOVER);
  const followingPreviews = useSocialHubStore((s) => s.hub?.followingPreviews ?? EMPTY_PREVIEWS);
  const { recentMentionIds, recordMentionPick } = useMentionRecents(user?.id);

  const posts = opts.posts;

  const candidates = useMemo(
    () =>
      buildMentionPickList({
        userId: user?.id,
        username: user?.username,
        followingIds,
        discoverUsers,
        followingPreviews,
        recentMentionIds,
        extra: opts.extra,
        posts,
      }),
    [
      user?.id,
      user?.username,
      followingIds,
      discoverUsers,
      followingPreviews,
      recentMentionIds,
      opts.extra,
      posts,
    ]
  );

  const mentionDirectory = useMemo(() => mentionDirectoryFromCandidates(candidates), [candidates]);

  return { candidates, mentionDirectory, recordMentionPick };
}
