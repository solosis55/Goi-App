import Svg, { Circle, Path, Rect } from "react-native-svg";
import { AUTH } from "../../constants/authUi";

type IconProps = {
  size?: number;
  color?: string;
};

export function WorkoutBellOnIcon({ size = 18, color = AUTH.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5c-2.2 0-4 1.65-4 3.85v2.1l-1.4 2.1a1 1 0 0 0 .83 1.55h9.14a1 1 0 0 0 .83-1.55l-1.4-2.1v-2.1C16 5.15 14.2 3.5 12 3.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M10 18.5h4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function WorkoutBellOffIcon({ size = 18, color = AUTH.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5c-2.2 0-4 1.65-4 3.85v2.1l-1.4 2.1a1 1 0 0 0 .83 1.55h9.14a1 1 0 0 0 .83-1.55l-1.4-2.1v-2.1C16 5.15 14.2 3.5 12 3.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M10 18.5h4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="m5 5 14 14" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function WorkoutCheckIcon({ size = 16, color = AUTH.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 12.2 10 15.7l7.5-8"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WorkoutRestIcon({ size = 16, color = AUTH.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.6} />
      <Path d="M12 7.5v5l3 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function WorkoutNotesIcon({ size = 16, color = AUTH.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={4} width={14} height={16} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M8.5 9h7M8.5 12.5h7M8.5 16h4.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function WorkoutTimerPlayIcon({ size = 16, color = AUTH.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 7.5v9l7.5-4.5L9 7.5Z" fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round" />
    </Svg>
  );
}

export function WorkoutTimerStopIcon({ size = 14, color = AUTH.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={8} y={8} width={8} height={8} rx={1.5} fill={color} />
    </Svg>
  );
}

/** Lado, material y meta del ejercicio (etiquetas). */
export function WorkoutLabelsIcon({ size = 16, color = AUTH.gold }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 6.5h8.2a2 2 0 0 1 1.4.58l4.4 4.4A2 2 0 0 1 20 12.7V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Circle cx={8.5} cy={11.5} r={1.15} fill={color} />
    </Svg>
  );
}
