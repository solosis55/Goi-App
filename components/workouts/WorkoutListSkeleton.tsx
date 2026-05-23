import { StyleSheet, View } from "react-native";
import { AUTH } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

function Bone({ style }: { style: object }) {
  return <View style={[styles.bone, style]} />;
}

function CardSkeleton() {
  return (
    <View style={workoutScreenStyles.listCard}>
      <View style={workoutScreenStyles.cardGlowLine} />
      <View style={styles.cardTop}>
        <Bone style={styles.thumb} />
        <View style={styles.titleCol}>
          <Bone style={styles.title} />
          <Bone style={styles.sub} />
        </View>
        <Bone style={styles.menu} />
      </View>
      <View style={styles.chipsRow}>
        <Bone style={styles.chip} />
        <Bone style={styles.chip} />
        <Bone style={styles.chipShort} />
      </View>
      <View style={styles.actionsRow}>
        <Bone style={styles.editBtn} />
        <Bone style={styles.trainBtn} />
      </View>
    </View>
  );
}

export function WorkoutListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  bone: {
    backgroundColor: "rgba(38, 38, 38, 0.55)",
    borderRadius: 8,
  },
  cardTop: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  titleCol: {
    flex: 1,
    gap: 8,
  },
  title: {
    height: 16,
    width: "75%",
  },
  sub: {
    height: 12,
    width: "50%",
  },
  menu: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  chip: {
    height: 24,
    width: 72,
    borderRadius: 8,
  },
  chipShort: {
    height: 24,
    width: 36,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  editBtn: {
    height: 44,
    width: 64,
    borderRadius: 10,
  },
  trainBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
  },
});
