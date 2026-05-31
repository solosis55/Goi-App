import Svg, { Circle, Path, Rect } from "react-native-svg";
import { AUTH } from "../../constants/authUi";

type IconProps = {
  size?: number;
  color?: string;
  filled?: boolean;
};

export function TabHomeIcon({ size = 26, color = AUTH.muted, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
        stroke={color}
        strokeWidth={filled ? 0 : 1.75}
        fill={filled ? color : "none"}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TabDumbbellIcon({ size = 26, color = AUTH.muted, filled }: IconProps) {
  const stroke = filled ? 0 : 1.75;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={9} width={3} height={6} rx={1} fill={filled ? color : "none"} stroke={color} strokeWidth={stroke} />
      <Rect x={19} y={9} width={3} height={6} rx={1} fill={filled ? color : "none"} stroke={color} strokeWidth={stroke} />
      <Path
        d="M5 12h14"
        stroke={color}
        strokeWidth={filled ? 2.5 : 1.75}
        strokeLinecap="round"
      />
      <Rect x={7} y={10.5} width={2.5} height={3} rx={0.5} fill={color} />
      <Rect x={14.5} y={10.5} width={2.5} height={3} rx={0.5} fill={color} />
    </Svg>
  );
}

export function TabStatsIcon({ size = 26, color = AUTH.muted, filled }: IconProps) {
  const stroke = filled ? 0 : 1.75;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 19V11M10 19V7M15 19v-5M20 19V4"
        stroke={color}
        strokeWidth={stroke || 2}
        strokeLinecap="round"
        fill="none"
      />
      {filled ? (
        <>
          <Rect x={4} y={11} width={2} height={8} rx={0.5} fill={color} />
          <Rect x={9} y={7} width={2} height={12} rx={0.5} fill={color} />
          <Rect x={14} y={14} width={2} height={5} rx={0.5} fill={color} />
          <Rect x={19} y={4} width={2} height={15} rx={0.5} fill={color} />
        </>
      ) : null}
    </Svg>
  );
}

/** Personas / red social (pestaña Social). */
export function TabNotificationsIcon({ size = 26, color = AUTH.muted, filled }: IconProps) {
  const stroke = filled ? 0 : 1.75;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z"
        stroke={color}
        strokeWidth={stroke || 1.75}
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
      <Path
        d="M10 20a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={stroke || 1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TabSearchIcon({ size = 26, color = AUTH.muted, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={10.5}
        cy={10.5}
        r={5.75}
        stroke={color}
        strokeWidth={filled ? 0 : 1.75}
        fill={filled ? color : "none"}
      />
      <Path
        d="M15 15 20 20"
        stroke={color}
        strokeWidth={filled ? 2.25 : 1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TabSocialIcon({ size = 26, color = AUTH.muted, filled }: IconProps) {
  const stroke = filled ? 0 : 1.75;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={9}
        cy={9}
        r={2.75}
        stroke={color}
        strokeWidth={stroke || 1.75}
        fill={filled ? color : "none"}
      />
      <Circle
        cx={16.5}
        cy={10}
        r={2.25}
        stroke={color}
        strokeWidth={stroke || 1.75}
        fill={filled ? color : "none"}
      />
      <Path
        d="M4.5 18.5c.9-2.4 2.7-3.75 4.5-3.75s3.6 1.35 4.5 3.75M13.5 17.75c.75-1.65 2.1-2.5 3.75-2.5 1.35 0 2.55.6 3.25 1.75"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        fill="none"
      />
      {filled ? (
        <Path
          d="M3 19.5c1-2.8 3.2-4.25 6-4.25M13 18.5c.85-2 2.5-3 4.5-3s3.65 1 4.5 3"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
        />
      ) : null}
    </Svg>
  );
}

export function TabProfileIcon({ size = 26, color = AUTH.muted, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12}
        cy={8}
        r={3.25}
        stroke={color}
        strokeWidth={filled ? 0 : 1.75}
        fill={filled ? color : "none"}
      />
      <Path
        d="M5.5 19.5c1.2-3.1 3.6-4.75 6.5-4.75s5.3 1.65 6.5 4.75"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        fill="none"
      />
      {filled ? (
        <Path
          d="M4 20a8 8 0 0 1 16 0"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
        />
      ) : (
        <Circle cx={12} cy={12} r={9.25} stroke={color} strokeWidth={1.75} />
      )}
    </Svg>
  );
}
