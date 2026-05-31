import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AUTH } from "../../../constants/authUi";

type SessionDetailTimelineListProps = {
  children: ReactNode;
};

export function SessionDetailTimelineList({ children }: SessionDetailTimelineListProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.rail} pointerEvents="none">
        <View style={styles.line} />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

type SessionDetailTimelineItemProps = {
  children: ReactNode;
  isLast?: boolean;
};

export function SessionDetailTimelineItem({ children, isLast }: SessionDetailTimelineItemProps) {
  return (
    <View style={[styles.item, isLast ? styles.itemLast : null]}>
      <View style={styles.dotWrap}>
        <View style={styles.dot} />
      </View>
      <View style={styles.itemBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  rail: {
    position: "absolute",
    left: 3,
    top: 12,
    bottom: 12,
    width: 8,
    alignItems: "center",
  },
  line: {
    flex: 1,
    width: 2,
    borderRadius: 1,
    backgroundColor: "rgba(212, 175, 55, 0.22)",
  },
  content: {
    paddingLeft: 18,
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  itemLast: {},
  dotWrap: {
    width: 8,
    marginTop: 18,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AUTH.gold,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.55)",
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
});
