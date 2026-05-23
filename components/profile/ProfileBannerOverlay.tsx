import { StyleSheet, View } from "react-native";

/** Degradado inferior sobre la cabecera (sin dependencia extra). */
export function ProfileBannerOverlay() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.fadeLight} />
      <View style={styles.fadeMid} />
      <View style={styles.fadeStrong} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  fadeLight: {
    height: 40,
    backgroundColor: "rgba(10, 10, 12, 0.15)",
  },
  fadeMid: {
    height: 44,
    backgroundColor: "rgba(10, 10, 12, 0.45)",
  },
  fadeStrong: {
    height: 52,
    backgroundColor: "rgba(10, 10, 12, 0.88)",
  },
});
