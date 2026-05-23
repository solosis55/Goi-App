import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type WorkoutSectionCardProps = {
  title: string;
  kicker?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
};

export function WorkoutSectionCard({
  title,
  kicker,
  actionLabel,
  onAction,
  children,
}: WorkoutSectionCardProps) {
  return (
    <View style={workoutScreenStyles.sectionCard}>
      <View style={workoutScreenStyles.cardGlowLine} />
      <View style={styles.head}>
        <View style={styles.headText}>
          {kicker ? (
            <Text style={workoutScreenStyles.sectionKicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {kicker}
            </Text>
          ) : null}
          <Text style={workoutScreenStyles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {title}
          </Text>
        </View>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [workoutScreenStyles.ghostBtn, pressed ? workoutScreenStyles.pressed : null]}
          >
            <Text style={workoutScreenStyles.ghostBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 4,
  },
  headText: {
    flex: 1,
    gap: 4,
  },
});
