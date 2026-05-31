import { FlashList, type FlashListProps, type FlashListRef } from "@shopify/flash-list";
import { forwardRef } from "react";
import Animated from "react-native-reanimated";
import type { FeedListItem } from "../../utils/feedListItems";

const BaseAnimatedFlashList = Animated.createAnimatedComponent(FlashList<FeedListItem>);

export type FeedAnimatedFlashListRef = FlashListRef<FeedListItem>;

export type FeedAnimatedFlashListProps = FlashListProps<FeedListItem>;

export const FeedAnimatedFlashList = forwardRef<FeedAnimatedFlashListRef, FeedAnimatedFlashListProps>(
  function FeedAnimatedFlashList(props, ref) {
    return <BaseAnimatedFlashList {...props} ref={ref} />;
  }
);
