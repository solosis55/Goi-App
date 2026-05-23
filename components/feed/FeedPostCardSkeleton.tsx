import { StyleSheet, View, useWindowDimensions } from "react-native";
import { AUTH } from "../../constants/authUi";

const MAX_CONTENT_WIDTH = 672;

function Bone({ style }: { style: object }) {
  return <View style={[styles.bone, style]} />;
}

function FeedPostCardSkeletonOne() {
  const { width: windowWidth } = useWindowDimensions();
  const mediaWidth = Math.min(windowWidth - 32, MAX_CONTENT_WIDTH);
  const mediaHeight = Math.round(mediaWidth * (5 / 4));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Bone style={styles.avatar} />
        <View style={styles.headerLines}>
          <Bone style={styles.lineTitle} />
          <Bone style={styles.lineBadge} />
        </View>
      </View>
      <Bone style={{ width: mediaWidth, height: mediaHeight, borderRadius: 0, alignSelf: "center" }} />
      <View style={styles.actions}>
        <Bone style={styles.iconBone} />
        <Bone style={styles.iconBone} />
      </View>
      <View style={styles.body}>
        <Bone style={styles.lineBody} />
        <Bone style={styles.lineBodyShort} />
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
    backgroundColor: "rgba(9, 9, 11, 0.82)",
    overflow: "hidden",
  },
  bone: {
    backgroundColor: "rgba(38, 38, 38, 0.55)",
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
    paddingVertical: 10,
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
