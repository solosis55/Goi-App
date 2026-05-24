import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import type { Post } from "../types/post";
import { consumeProfilePostDetailSync } from "../utils/profilePostDetailSession";

export function useSyncProfilePostFromDetail(
  apply: (sync: { post: Post | null; deleted?: boolean }) => void
): void {
  useFocusEffect(
    useCallback(() => {
      const sync = consumeProfilePostDetailSync();
      if (sync) apply(sync);
    }, [apply])
  );
}
