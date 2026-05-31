import { useCallback, useState } from "react";
import { getUsersPreviews } from "../api/auth";
import { loadMutedUserIds, unmuteUser } from "../utils/feedLocalPrefs";

export type MutedUserRow = { id: string; username: string };

export function useMutedUsers(userId: string | undefined) {
  const [rows, setRows] = useState<MutedUserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!userId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const ids = await loadMutedUserIds(userId);
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

  const handleUnmute = useCallback(
    async (targetUserId: string) => {
      if (!userId) return;
      await unmuteUser(userId, targetUserId);
      await reload();
    },
    [userId, reload]
  );

  return { rows, loading, reload, unmute: handleUnmute };
}
