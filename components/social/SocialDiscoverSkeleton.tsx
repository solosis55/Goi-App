import { StyleSheet, View } from "react-native";

export function SocialDiscoverSkeleton() {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.lines}>
            <View style={styles.lineWide} />
            <View style={styles.lineNarrow} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(82, 82, 82, 0.35)",
  },
  lines: {
    flex: 1,
    gap: 6,
  },
  lineWide: {
    height: 12,
    borderRadius: 4,
    width: "55%",
    backgroundColor: "rgba(82, 82, 82, 0.35)",
  },
  lineNarrow: {
    height: 10,
    borderRadius: 4,
    width: "35%",
    backgroundColor: "rgba(82, 82, 82, 0.28)",
  },
});
