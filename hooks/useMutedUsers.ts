import { useCallback, useEffect, useState } from "react";
import { getUsersPreviews } from "../api/auth";
import { useFeedPrefsStore } from "../stores/useFeedPrefsStore";

export type MutedUserRow = { id: string; username: string };

export function useMutedUsers(userId: string | undefined) {
  const mutedUserIds = useFeedPrefsStore((s) => s.mutedUserIds);
  const unmuteAuthor = useFeedPrefsStore((s) => s.unmuteAuthor);
  const [rows, setRows] = useState<MutedUserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!userId) {
      setRows([]);
      return;
    }
    const ids = useFeedPrefsStore.getState().mutedUserIds;
    setLoading(true);
    try {
      if (ids.length === 0) {
        setRows([]);
        return;
      }
      try {
        const { users } = await getUsersPreviews(ids);
        const map = new Map(users.map((u) => [u.id, u.username] as const));
        setRows(ids.map((id) => ({ id, username: map.get(id) ?? `usuario-${id.slice(0, 6)}` })));
      } catch {
        setRows(ids.map((id) => ({ id, username: `usuario-${id.slice(0, 6)}` })));
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload, mutedUserIds]);

  const handleUnmute = useCallback(
    async (targetUserId: string) => {
      if (!userId) return;
      await unmuteAuthor(userId, targetUserId);
    },
    [userId, unmuteAuthor]
  );

  return { rows, loading, reload, unmute: handleUnmute };
}
