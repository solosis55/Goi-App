import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type SocialWeeklyChallengeCardProps = {
  followingActiveCount: number;
  followingTotal: number;
  mySessionsWeek: number;
  onPressTrain: () => void;
  onPressSeeActive: () => void;
};

export function SocialWeeklyChallengeCard({
  followingActiveCount,
  followingTotal,
  mySessionsWeek,
  onPressTrain,
  onPressSeeActive,
}: SocialWeeklyChallengeCardProps) {
  const goal = 3;
  const progress = Math.min(mySessionsWeek, goal);
  const pct = Math.round((progress / goal) * 100);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Reto semanal
      </Text>
      <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Tú: {mySessionsWeek} entreno{mySessionsWeek === 1 ? "" : "s"} esta semana · Meta {goal}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.meta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {followingActiveCount} de {followingTotal} que sigues estuvieron activos
      </Text>
      <View style={styles.actions}>
        <Pressable onPress={onPressTrain} style={({ pressed }) => [styles.btn, pressed ? styles.pressed : null]}>
          <Text style={styles.btnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Entrenar
          </Text>
        </Pressable>
        <Pressable
          onPress={onPressSeeActive}
          style={({ pressed }) => [styles.btnGhost, pressed ? styles.pressed : null]}
        >
          <Text style={styles.btnGhostText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Ver activos
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
    backgroundColor: "rgba(35, 32, 22, 0.4)",
    gap: 8,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "700",
  },
  body: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(64, 64, 64, 0.65)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: AUTH.gold,
    borderRadius: 3,
  },
  meta: {
    color: AUTH.faint,
    fontSize: 11,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    alignItems: "center",
  },
  btnText: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  btnGhost: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
    alignItems: "center",
  },
  btnGhostText: {
    color: AUTH.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
