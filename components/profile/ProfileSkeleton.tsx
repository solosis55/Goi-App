import { StyleSheet, View } from "react-native";
import { AUTH } from "../../constants/authUi";

function Bone({ style }: { style: object }) {
  return <View style={[styles.bone, style]} />;
}

export function ProfileSkeleton() {
  return (
    <View style={styles.root}>
      <Bone style={styles.banner} />
      <View style={styles.identityBlock}>
        <View style={styles.avatarRow}>
          <Bone style={styles.avatar} />
          <Bone style={styles.handle} />
        </View>
        <View style={styles.statsRow}>
          <Bone style={styles.stat} />
          <Bone style={styles.stat} />
          <Bone style={styles.stat} />
        </View>
      </View>
      <View style={styles.surface}>
        <Bone style={styles.kicker} />
        <Bone style={styles.workoutBar} />
        <Bone style={styles.bio} />
        <Bone style={styles.bioShort} />
      </View>
      <View style={styles.tabs}>
        <Bone style={styles.tab} />
        <Bone style={styles.tab} />
        <Bone style={styles.tab} />
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <Bone key={i} style={styles.gridCell} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bone: {
    backgroundColor: "rgba(64, 64, 64, 0.55)",
  },
  banner: {
    height: 148,
    width: "100%",
  },
  identityBlock: {
    paddingHorizontal: 16,
    marginTop: -36,
    gap: 12,
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  handle: {
    flex: 1,
    height: 22,
    borderRadius: 6,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    paddingLeft: 4,
  },
  stat: {
    width: 56,
    height: 36,
    borderRadius: 6,
  },
  surface: {
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: "rgba(10, 10, 12, 0.55)",
  },
  kicker: {
    width: 72,
    height: 12,
    borderRadius: 4,
  },
  workoutBar: {
    height: 52,
    borderRadius: 10,
    width: "100%",
  },
  bio: {
    height: 14,
    width: "92%",
    borderRadius: 4,
  },
  bioShort: {
    height: 14,
    width: "65%",
    borderRadius: 4,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    height: 32,
    borderRadius: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    paddingTop: 8,
  },
  gridCell: {
    width: "33.1%",
    aspectRatio: 1,
  },
});
