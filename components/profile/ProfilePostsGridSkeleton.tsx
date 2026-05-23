import { StyleSheet, View, useWindowDimensions } from "react-native";

const COLS = 3;
const GAP = 1;
const PLACEHOLDER_COUNT = 12;

function Bone({ size }: { size: number }) {
  return <View style={[styles.bone, { width: size, height: size }]} />;
}

export function ProfilePostsGridSkeleton() {
  const { width } = useWindowDimensions();
  const cellSize = (width - GAP * (COLS - 1)) / COLS;

  return (
    <View style={styles.grid} accessibilityLabel="Cargando publicaciones">
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
        <Bone key={i} size={cellSize} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  bone: {
    backgroundColor: "rgba(64, 64, 64, 0.55)",
  },
});
