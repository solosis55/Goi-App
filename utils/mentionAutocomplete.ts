export type MentionPickUser = {
  id: string;
  username: string;
  avatarUrl?: string;
  /** Prioriza en sugerencias @. */
  isFollowing?: boolean;
  /** 0 = más reciente; null/undefined = sin prioridad reciente. */
  recentRank?: number | null;
};

export function getActiveMention(value: string, caret: number): { triggerIndex: number; query: string } | null {
  const slice = value.slice(0, caret);
  const lastAt = slice.lastIndexOf("@");
  if (lastAt < 0) return null;
  if (lastAt > 0 && !/\s/.test(slice.charAt(lastAt - 1) ?? "")) return null;
  const afterAt = slice.slice(lastAt + 1);
  if (afterAt.includes("\n")) return null;
  const segment = (afterAt.split(/\s/)[0] ?? "").slice(0, 24);
  if (!/^[\w]*$/i.test(segment)) return null;
  return { triggerIndex: lastAt, query: segment };
}

export function filterMentionCandidates(
  candidates: MentionPickUser[],
  rawQuery: string,
  opts?: { max?: number }
): MentionPickUser[] {
  const max = opts?.max ?? 8;
  const q = rawQuery.toLowerCase();
  const uniq = new Map<string, MentionPickUser>();
  for (const c of candidates) {
    uniq.set(c.id, c);
  }
  const rank = (candidate: MentionPickUser) => {
    const followScore = candidate.isFollowing ? 1000 : 0;
    const recentScore =
      typeof candidate.recentRank === "number" && candidate.recentRank >= 0
        ? Math.max(0, 400 - candidate.recentRank * 40)
        : 0;
    return followScore + recentScore;
  };
  const sorted = [...uniq.values()].sort((a, b) => {
    const byScore = rank(b) - rank(a);
    if (byScore !== 0) return byScore;
    return a.username.localeCompare(b.username);
  });
  if (!q) return sorted.slice(0, max);
  return sorted.filter((c) => c.username.toLowerCase().startsWith(q)).slice(0, max);
}
