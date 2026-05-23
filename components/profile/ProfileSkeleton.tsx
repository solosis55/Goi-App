import { StyleSheet, View } from "react-native";
import { AUTH } from "../../constants/authUi";

function Bone({ style }: { style: object }) {
  return <View style={[styles.bone, style]} />;
}

export function ProfileSkeleton() {
  return (
    <View style={styles.root}>
      <Bone style={styles.banner} />
      <View style={styles.avatarRow}>
        <Bone style={styles.avatar} />
        <View style={styles.lines}>
          <Bone style={styles.lineLg} />
          <Bone style={styles.lineSm} />
        </View>
      </View>
      <View style={styles.fields}>
        <Bone style={styles.field} />
        <Bone style={styles.field} />
        <Bone style={styles.fieldTall} />
        <Bone style={styles.field} />
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -40,
    paddingHorizontal: 16,
    gap: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  lines: {
    flex: 1,
    gap: 10,
    paddingTop: 44,
  },
  lineLg: {
    height: 18,
    width: "55%",
    borderRadius: 6,
  },
  lineSm: {
    height: 14,
    width: "40%",
    borderRadius: 6,
  },
  fields: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  field: {
    height: 44,
    borderRadius: 10,
  },
  fieldTall: {
    height: 96,
    borderRadius: 10,
  },
});
