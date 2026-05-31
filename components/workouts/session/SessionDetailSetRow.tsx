import { Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { workoutSetTypePerformStyle } from "../../../constants/workoutSetTypes";
import type { WorkoutSessionSnapshotSet } from "../../../types/workoutSessionSnapshot";
import type { SetHighlight } from "../../../utils/sessionExerciseSummary";
import { buildSessionSetDisplay, isNonNormalSetType } from "../../../utils/sessionSetDisplay";
import { WorkoutSetTypeIcon } from "../WorkoutSetTypeIcon";
import { sessionDetailStyles as s } from "./sessionDetailStyles";

type SessionDetailSetRowProps = {
  index: number;
  set: WorkoutSessionSnapshotSet;
  highlight?: SetHighlight;
};

function MetricCell({
  label,
  value,
  plan,
  muted,
}: {
  label: string;
  value: string | null;
  plan?: string | null;
  muted?: boolean;
}) {
  return (
    <View style={s.metricCell}>
      <Text style={s.metricLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
      <Text
        style={[s.metricValue, muted ? s.metricValueMuted : null, !value ? s.metricEmpty : null]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        numberOfLines={1}
      >
        {value ?? "—"}
      </Text>
      {plan ? (
        <Text style={s.metricPlan} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          obj. {plan}
        </Text>
      ) : null}
    </View>
  );
}

function HighlightBadge({ kind }: { kind: "pr" | "top" }) {
  const label = kind === "pr" ? "PR" : "Top";
  return (
    <View style={[s.highlightBadge, kind === "pr" ? s.highlightBadgePr : s.highlightBadgeTop]}>
      <Text
        style={[s.highlightBadgeText, kind === "top" ? s.highlightBadgeTextTop : null]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {label}
      </Text>
    </View>
  );
}

export function SessionDetailSetRow({ index, set, highlight = null }: SessionDetailSetRowProps) {
  const display = buildSessionSetDisplay(set);
  const typeStyle = workoutSetTypePerformStyle(display.setType);
  const showType = isNonNormalSetType(display.setType);
  const repsLabel = display.timedNote ? "Tiempo" : "Reps";
  const repsValue = display.timedNote ?? (display.reps ? display.reps : null);

  return (
    <View style={[s.setRow, display.pending ? s.setRowPending : null]}>
      <Text
        style={[s.setIndex, display.pending ? s.setIndexPending : null]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {index + 1}
      </Text>

      <View style={[s.typePill, showType ? { borderColor: `${typeStyle.color}55` } : s.typePillMuted]}>
        <WorkoutSetTypeIcon
          slug={display.setType}
          size="sm"
          style={{ color: typeStyle.color, opacity: typeStyle.opacity ?? 1 }}
        />
      </View>

      <View style={s.metrics}>
        <MetricCell label="Kg" value={display.kg} plan={display.planKg} muted={display.pending} />
        <MetricCell
          label={repsLabel}
          value={repsValue}
          plan={display.planReps && !display.timedNote ? display.planReps : null}
          muted={display.pending}
        />
        {display.rpe ? (
          <View style={s.rpeCell}>
            <Text style={s.metricLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              RPE
            </Text>
            <Text style={s.rpeValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {display.rpe}
            </Text>
          </View>
        ) : null}
        {highlight ? <HighlightBadge kind={highlight} /> : null}
      </View>

      {display.extraLines.length > 0 ? (
        <View style={s.extrasCol}>
          {display.extraLines.map((line) => (
            <Text key={line} style={s.extraLine} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
