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

export function useMentionCandidates(opts: UseMentionCandidatesOpts = {}) {
  const { user } = useAuth();
  const followingIds = useSocialHubStore((s) => s.followingIds);
  const discoverUsers = useSocialHubStore((s) => s.hub?.discoverUsers ?? []);
  const followingPreviews = useSocialHubStore((s) => s.hub?.followingPreviews ?? []);
  const { recentMentionIds, recordMentionPick } = useMentionRecents(user?.id);

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
        posts: opts.posts,
      }),
    [
      user?.id,
      user?.username,
      followingIds,
      discoverUsers,
      followingPreviews,
      recentMentionIds,
      opts.extra,
      opts.posts,
    ]
  );

  const mentionDirectory = useMemo(() => mentionDirectoryFromCandidates(candidates), [candidates]);

  return { candidates, mentionDirectory, recordMentionPick };
}
