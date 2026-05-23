import { StyleSheet, View } from "react-native";
import { AUTH } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

function Bone({ style }: { style: object }) {
  return <View style={[styles.bone, style]} />;
}

function CardSkeleton() {
  return (
    <View style={workoutScreenStyles.listCard}>
      <Bone style={styles.title} />
      <Bone style={styles.line} />
      <Bone style={styles.btn} />
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
  title: {
    height: 18,
    width: "70%",
    marginBottom: 10,
  },
  line: {
    height: 12,
    width: "90%",
    marginBottom: 14,
  },
  btn: {
    height: 44,
    width: "100%",
    borderRadius: 12,
  },
});
