import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";

type WorkoutHubEmptyStateProps = {
  title: string;
  body: string;
  cta?: ReactNode;
};

export function WorkoutHubEmptyState({ title, body, cta }: WorkoutHubEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={workoutScreenStyles.hubIconRing}>
        <TabDumbbellIcon size={28} color="#d4af37" filled />
      </View>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>
      <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {body}
      </Text>
      {cta ? <View style={styles.cta}>{cta}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  cta: {
    alignSelf: "stretch",
    width: "100%",
    marginTop: 8,
  },
});
