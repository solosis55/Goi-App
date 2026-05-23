import { View } from "react-native";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type SetsProgressBarProps = {
  ratio: number;
  accessibilityLabel?: string;
};

export function SetsProgressBar({ ratio, accessibilityLabel }: SetsProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  const label = accessibilityLabel ?? `Progreso al ${pct} por ciento`;

  return (
    <View style={workoutScreenStyles.progressTrack} accessibilityLabel={label}>
      <View style={[workoutScreenStyles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}
