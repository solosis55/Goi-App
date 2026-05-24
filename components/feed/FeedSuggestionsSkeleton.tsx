import { StyleSheet, View } from "react-native";
import { AUTH } from "../../constants/authUi";

const CARD_WIDTH = 92;
const SECTION_INSET = 14;

export function FeedSuggestionsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.accent} />
          <View style={styles.body}>
            <View style={styles.avatar} />
            <View style={styles.lineWide} />
            <View style={styles.lineNarrow} />
            <View style={styles.btn} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: SECTION_INSET,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 142,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.35)",
    backgroundColor: "rgba(14, 14, 16, 0.6)",
    overflow: "hidden",
  },
  accent: {
    height: 2,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  body: {
    padding: 8,
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(82, 82, 82, 0.4)",
  },
  lineWide: {
    width: "80%",
    height: 10,
    borderRadius: 4,
    backgroundColor: "rgba(82, 82, 82, 0.35)",
  },
  lineNarrow: {
    width: "60%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(82, 82, 82, 0.28)",
  },
  btn: {
    width: "100%",
    height: 28,
    borderRadius: 14,
    marginTop: 4,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
});
