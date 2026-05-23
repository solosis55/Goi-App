import Svg, { Circle, Path } from "react-native-svg";

export function ProfileLinkWebIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.75} />
      <Path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" stroke={color} strokeWidth={1.75} />
    </Svg>
  );
}

export function ProfileLinkInstagramIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <Path
        d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z"
        stroke={color}
        strokeWidth={1.75}
      />
      <Circle cx={12} cy={12} r={3.25} stroke={color} strokeWidth={1.75} />
      <Circle cx={17.2} cy={6.8} r={0.9} fill={color} />
    </Svg>
  );
}

export function ProfileLinkStravaIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <Path d="M4 18l5-10 4 7 3-5 4 8H4z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
    </Svg>
  );
}

export function ProfileLocationIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <Path
        d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={11} r={2.25} stroke={color} strokeWidth={1.75} />
    </Svg>
  );
}
