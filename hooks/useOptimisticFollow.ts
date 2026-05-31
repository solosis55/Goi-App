import { useCallback } from "react";
import { toggleFollow } from "../api/auth";
import type { DiscoverUser } from "../types/auth";

type UseOptimisticFollowOptions = {
  onFollowingChanged: (targetId: string, following: boolean, pending?: boolean) => void;
  onError?: () => void;
};

export function useOptimisticFollow({ onFollowingChanged, onError }: UseOptimisticFollowOptions) {
  return useCallback(
    async (target: Pick<DiscoverUser, "id" | "followPending">, alreadyFollowing: boolean) => {
      if (alreadyFollowing || target.followPending) return;
      onFollowingChanged(target.id, false, true);
      try {
        const res = await toggleFollow(target.id);
        const pending = res.pending === true || res.status === "pending";
        onFollowingChanged(target.id, res.following, pending);
        return res;
      } catch {
        onFollowingChanged(target.id, false, false);
        onError?.();
        return null;
      }
    },
    [onFollowingChanged, onError]
  );
}
