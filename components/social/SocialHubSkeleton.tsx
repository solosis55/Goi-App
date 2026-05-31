import { StyleSheet, View } from "react-native";

function Bone({ style }: { style?: object }) {
  return <View style={[styles.bone, style]} />;
}

export function SocialHubSkeleton() {
  return (
    <View style={styles.wrap}>
      <Bone style={styles.hero} />
      <Bone style={styles.block} />
      <Bone style={styles.block} />
      <Bone style={styles.blockShort} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 14,
    gap: 12,
  },
  bone: {
    borderRadius: 10,
    backgroundColor: "rgba(82, 82, 82, 0.35)",
  },
  hero: {
    height: 88,
  },
  block: {
    height: 120,
  },
  blockShort: {
    height: 72,
  },
});
