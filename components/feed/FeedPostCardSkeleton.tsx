import { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AUTH } from "../../constants/authUi";

const MAX_CONTENT_WIDTH = 672;

function ShimmerBone({ style }: { style: object }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.75, { duration: 700 }), withTiming(0.4, { duration: 700 })),
      -1,
      false
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.bone, style, animStyle]} />;
}

function FeedPostCardSkeletonOne() {
  const { width: windowWidth } = useWindowDimensions();
  const mediaWidth = Math.min(windowWidth - 32, MAX_CONTENT_WIDTH);
  const mediaHeight = Math.round(mediaWidth * (5 / 4));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ShimmerBone style={styles.avatar} />
        <View style={styles.headerLines}>
          <ShimmerBone style={styles.lineTitle} />
          <ShimmerBone style={styles.lineBadge} />
        </View>
      </View>
      <ShimmerBone style={{ width: mediaWidth, height: mediaHeight, borderRadius: 0, alignSelf: "center" }} />
      <View style={styles.actions}>
        <ShimmerBone style={styles.iconBone} />
        <ShimmerBone style={styles.iconBone} />
        <ShimmerBone style={styles.iconBone} />
        <ShimmerBone style={styles.iconBone} />
      </View>
      <ShimmerBone style={styles.statsLine} />
      <View style={styles.body}>
        <ShimmerBone style={styles.lineBody} />
        <ShimmerBone style={styles.lineBodyShort} />
      </View>
    </View>
  );
}

type FeedPostCardSkeletonProps = {
  count?: number;
};

export function FeedPostCardSkeleton({ count = 3 }: FeedPostCardSkeletonProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={i < count - 1 ? styles.itemGap : null}>
          <FeedPostCardSkeletonOne />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
  },
  itemGap: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(38, 38, 38, 0.9)",
    backgroundColor: "rgba(14, 14, 16, 0.92)",
    overflow: "hidden",
  },
  bone: {
    backgroundColor: "rgba(64, 64, 64, 0.55)",
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  headerLines: {
    flex: 1,
    gap: 10,
    paddingTop: 4,
  },
  lineTitle: {
    height: 14,
    width: "55%",
    borderRadius: 6,
  },
  lineBadge: {
    height: 20,
    width: 72,
    borderRadius: 999,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  statsLine: {
    marginHorizontal: 14,
    marginBottom: 6,
    height: 12,
    width: 140,
    borderRadius: 6,
  },
  iconBone: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  lineBody: {
    height: 12,
    width: "92%",
  },
  lineBodyShort: {
    height: 12,
    width: "64%",
  },
});
