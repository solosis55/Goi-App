import { StyleSheet, View } from "react-native";
import { AUTH } from "../../constants/authUi";

export function ExternalProfileSkeleton() {
  return (
    <View style={styles.root}>
      <View style={styles.banner} />
      <View style={styles.body}>
        <View style={styles.avatar} />
        <View style={styles.lineWide} />
        <View style={styles.line} />
        <View style={styles.statsRow}>
          <View style={styles.stat} />
          <View style={styles.stat} />
          <View style={styles.stat} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  banner: {
    height: 148,
    backgroundColor: "rgba(38, 38, 38, 0.95)",
  },
  body: {
    padding: 16,
    marginTop: -36,
    gap: 12,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(55, 55, 55, 0.9)",
  },
  lineWide: {
    height: 18,
    width: "55%",
    borderRadius: 6,
    backgroundColor: "rgba(55, 55, 55, 0.9)",
    marginTop: 8,
  },
  line: {
    height: 12,
    width: "40%",
    borderRadius: 6,
    backgroundColor: "rgba(45, 45, 45, 0.9)",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  stat: {
    height: 28,
    width: 56,
    borderRadius: 8,
    backgroundColor: "rgba(45, 45, 45, 0.9)",
  },
});
