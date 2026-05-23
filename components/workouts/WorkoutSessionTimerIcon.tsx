import Svg, { Path, Rect } from "react-native-svg";
import { AUTH } from "../../constants/authUi";

type WorkoutSessionTimerIconProps = {
  /** true = sesión pausada → icono de reanudar (play) */
  paused: boolean;
  size?: number;
  color?: string;
};

export function WorkoutSessionTimerIcon({
  paused,
  size = 16,
  color = AUTH.gold,
}: WorkoutSessionTimerIconProps) {
  if (paused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8.5 7.2c0-.66.72-1.07 1.3-.75l8.2 4.8c.55.32.55 1.18 0 1.5l-8.2 4.8c-.58.32-1.3-.09-1.3-.75V7.2Z"
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={7} y={6} width={3.5} height={12} rx={1.2} fill={color} />
      <Rect x={13.5} y={6} width={3.5} height={12} rx={1.2} fill={color} />
    </Svg>
  );
}
