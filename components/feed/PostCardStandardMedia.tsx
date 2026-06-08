import { View } from "react-native";
import type { Post } from "../../types/post";
import { PostMediaCarousel } from "./PostMediaCarousel";
import { postCardStyles as styles } from "./postCardStyles";

type PostCardStandardMediaProps = {
  postId: string;
  media: Post["media"];
  mediaKey: string;
  slideWidth: number;
  onDoubleTapLike: () => void;
};

export function PostCardStandardMedia({
  postId,
  media,
  mediaKey,
  slideWidth,
  onDoubleTapLike,
}: PostCardStandardMediaProps) {
  return (
    <View style={styles.mediaBlock}>
      <PostMediaCarousel
        key={mediaKey}
        postId={postId}
        media={media ?? []}
        onDoubleTapLike={onDoubleTapLike}
        slideWidth={slideWidth}
        mediaAspect="square"
        layout="bleed"
      />
    </View>
  );
}
