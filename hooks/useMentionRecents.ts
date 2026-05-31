import { useCallback, useEffect, useState } from "react";
import type { MentionPickUser } from "../utils/mentionAutocomplete";
import { loadMentionRecents, nextMentionRecents, saveMentionRecents } from "../utils/mentionRecents";

export function useMentionRecents(userId: string | undefined) {
  const [recentMentionIds, setRecentMentionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setRecentMentionIds([]);
      return;
    }
    let cancelled = false;
    void loadMentionRecents(userId).then((ids) => {
      if (!cancelled) setRecentMentionIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const recordMentionPick = useCallback(
    (picked: MentionPickUser) => {
      if (!userId) return;
      setRecentMentionIds((current) => {
        const next = nextMentionRecents(current, picked, userId);
        void saveMentionRecents(userId, next);
        return next;
      });
    },
    [userId]
  );

  return { recentMentionIds, recordMentionPick };
}
