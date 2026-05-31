import { StyleSheet, View } from "react-native";
import type { FeedStoryAuthor } from "../../types/story";
import type { FeedSuggestionsPlacement } from "../../utils/feedSuggestionsVisibility";
import { FeedStoriesSection } from "./FeedStoriesSection";

type FeedDiscoveryZoneProps = {
  authors: FeedStoryAuthor[];
  currentUserId: string;
  seenRevision: number;
  onSelectAuthor: (userId: string) => void;
  suggestionsPlacement: FeedSuggestionsPlacement;
};

export function FeedDiscoveryZone({
  authors,
  currentUserId,
  seenRevision,
  onSelectAuthor,
}: FeedDiscoveryZoneProps) {
  return (
    <View style={styles.wrap}>
      <FeedStoriesSection
        authors={authors}
        currentUserId={currentUserId}
        seenRevision={seenRevision}
        onSelectAuthor={onSelectAuthor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
});
