import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FeedScope } from "../../constants/feed";
import type { FeedContentFilter } from "../../constants/feedContentFilter";
import { FeedContentFilters } from "./FeedContentFilters";
import { FeedFollowingScopeHint } from "./FeedFollowingScopeHint";
import { FeedModeTabs } from "./FeedModeTabs";

type FeedStickyScopeHeaderProps = {
  mode: FeedScope;
  onChangeMode: (mode: FeedScope) => void;
  showFollowingHint: boolean;
  contentFilter: FeedContentFilter;
  onChangeContentFilter: (filter: FeedContentFilter) => void;
};

export function FeedStickyScopeHeader({
  mode,
  onChangeMode,
  showFollowingHint,
  contentFilter,
  onChangeContentFilter,
}: FeedStickyScopeHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading} maxFontSizeMultiplier={1.2}>
        Publicaciones
      </Text>
      <FeedModeTabs mode={mode} onChangeMode={onChangeMode} />
      <FeedContentFilters value={contentFilter} onChange={onChangeContentFilter} />
      {showFollowingHint ? <FeedFollowingScopeHint /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 12,
    marginBottom: 4,
  },
  heading: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
  },
});
