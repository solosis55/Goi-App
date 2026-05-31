import type { DiscoverUser } from "../../types/auth";
import { FeedSuggestionsRow } from "../feed/FeedSuggestionsRow";
import { SocialSectionEmpty } from "./SocialSectionEmpty";

type SocialCompactUserListProps = {
  users: DiscoverUser[];
  followingIds: string[];
  currentUserId: string | undefined;
  onFollowingChanged: (targetId: string, following: boolean) => void;
  emptyTitle: string;
  emptyBody: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

export function SocialCompactUserList({
  users,
  followingIds,
  currentUserId,
  onFollowingChanged,
  emptyTitle,
  emptyBody,
  emptyActionLabel,
  onEmptyAction,
}: SocialCompactUserListProps) {
  if (users.length === 0) {
    return (
      <SocialSectionEmpty
        title={emptyTitle}
        body={emptyBody}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <FeedSuggestionsRow
      users={users}
      followingIds={followingIds}
      currentUserId={currentUserId}
      variant="list"
      embedded
      onFollowingChanged={onFollowingChanged}
    />
  );
}
