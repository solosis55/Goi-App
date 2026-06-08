import { FeedPostOverflowSheet } from "./FeedPostOverflowSheet";
import { PostOwnerMenuSheet } from "./PostOwnerMenuSheet";
import { PostLikesSheet } from "./PostLikesSheet";

type PostCardSheetsProps = {
  postId: string;
  authorUsername: string;
  likesCount: number;
  menuOpen: boolean;
  overflowOpen: boolean;
  likesSheetOpen: boolean;
  canOverflow: boolean;
  isPinned: boolean;
  onCloseMenu: () => void;
  onCloseOverflow: () => void;
  onCloseLikes: () => void;
  onEdit?: () => void;
  onConfirmDelete: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onMuteAuthor?: () => void;
  onReport?: () => void;
  onShare?: () => void;
};

export function PostCardSheets({
  postId,
  authorUsername,
  likesCount,
  menuOpen,
  overflowOpen,
  likesSheetOpen,
  canOverflow,
  isPinned,
  onCloseMenu,
  onCloseOverflow,
  onCloseLikes,
  onEdit,
  onConfirmDelete,
  onPin,
  onUnpin,
  onMuteAuthor,
  onReport,
  onShare,
}: PostCardSheetsProps) {
  return (
    <>
      <PostOwnerMenuSheet
        visible={menuOpen}
        onClose={onCloseMenu}
        onEdit={onEdit}
        onDelete={onConfirmDelete}
        isPinned={isPinned}
        onPin={onPin}
        onUnpin={onUnpin}
      />

      {canOverflow ? (
        <FeedPostOverflowSheet
          visible={overflowOpen}
          authorUsername={authorUsername}
          onClose={onCloseOverflow}
          onMuteAuthor={onMuteAuthor ?? (() => {})}
          onReport={onReport}
          onShare={onShare}
        />
      ) : null}

      <PostLikesSheet
        visible={likesSheetOpen}
        postId={postId}
        likesCount={likesCount}
        onClose={onCloseLikes}
      />
    </>
  );
}
