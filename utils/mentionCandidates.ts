import type { Post, PostComment } from "../types/post";
import type { MentionPickUser } from "./mentionAutocomplete";

type BuildMentionPickListInput = {
  userId?: string;
  username?: string;
  followingIds: string[];
  discoverUsers: Array<{ id: string; username: string; avatarUrl?: string }>;
  followingPreviews: Array<{ id: string; username: string; avatarUrl?: string }>;
  recentMentionIds: string[];
  extra?: MentionPickUser[];
  posts?: Post[];
};

export function buildMentionPickList({
  userId,
  username,
  followingIds,
  discoverUsers,
  followingPreviews,
  recentMentionIds,
  extra = [],
  posts = [],
}: BuildMentionPickListInput): MentionPickUser[] {
  const out: MentionPickUser[] = [];
  const seenByUserId = new Set<string>();
  const recentIndexById = new Map(recentMentionIds.map((id, idx) => [id, idx] as const));

  const pushCandidate = (candidate: MentionPickUser) => {
    if (seenByUserId.has(candidate.id)) return;
    seenByUserId.add(candidate.id);
    out.push({
      ...candidate,
      isFollowing: candidate.id !== userId && followingIds.includes(candidate.id),
      recentRank: recentIndexById.get(candidate.id) ?? null,
    });
  };

  if (userId && username) {
    pushCandidate({ id: userId, username });
  }
  for (const u of followingPreviews) {
    pushCandidate({ id: u.id, username: u.username, avatarUrl: u.avatarUrl });
  }
  for (const d of discoverUsers) {
    pushCandidate({ id: d.id, username: d.username, avatarUrl: d.avatarUrl });
  }
  for (const e of extra) {
    pushCandidate(e);
  }
  for (const p of posts) {
    pushCandidate({ id: p.userId, username: p.authorUsername });
    for (const c of p.comments) {
      pushCandidate({ id: c.userId, username: c.authorUsername });
    }
  }
  return out;
}

export function mentionDirectoryFromCandidates(candidates: readonly MentionPickUser[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const c of candidates) {
    m.set(c.username.toLowerCase(), c.id);
  }
  return m;
}

export function commentToMentionPick(comment: PostComment): MentionPickUser {
  return { id: comment.userId, username: comment.authorUsername };
}
