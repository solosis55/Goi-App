import Svg, { Circle, Path, Rect } from "react-native-svg";
import { AUTH } from "../../constants/authUi";

type GoiActivityIconProps = {
  size?: number;
  color?: string;
  accentColor?: string;
};

/** Campana de actividad con acento dorado (línea GoI). */
export function GoiActivityIcon({
  size = 22,
  color = AUTH.gold,
  accentColor = "rgba(240, 216, 120, 0.95)",
}: GoiActivityIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={3} width={14} height={1.5} rx={0.75} fill={accentColor} opacity={0.9} />
      <Path
        d="M18 16v-5a6 6 0 0 0-11.2-2.8A6 6 0 0 0 6 11v5l-2 3h16l-2-3Z"
        stroke={color}
        strokeWidth={1.65}
        strokeLinejoin="round"
        fill="rgba(212, 175, 55, 0.08)"
      />
      <Path
        d="M10 20a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={1.65}
        strokeLinecap="round"
      />
      <Circle cx={17} cy={7} r={2} fill={accentColor} opacity={0.85} />
    </Svg>
  );
}
