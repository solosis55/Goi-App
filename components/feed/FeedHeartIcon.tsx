import Svg, { Path } from "react-native-svg";

export function FeedHeartIcon({ filled, size = 22, color }: { filled: boolean; size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {filled ? (
        <Path
          fill={color}
          d="M12 21s-6.716-5.304-9.233-8.607C.32 9.59.32 6.26 2.49 4.22 4.66 2.18 7.79 2.39 9.9 4.22L12 6.13l2.1-1.91c2.11-1.83 5.24-2.04 7.41-.02 2.17 2.02 2.17 5.35-.28 8.18C16.72 15.7 12 21 12 21Z"
        />
      ) : (
        <Path
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          d="M12 21s-6.716-5.304-9.233-8.607C.32 9.59.32 6.26 2.49 4.22 4.66 2.18 7.79 2.39 9.9 4.22L12 6.13l2.1-1.91c2.11-1.83 5.24-2.04 7.41-.02 2.17 2.02 2.17 5.35-.28 8.18C16.72 15.7 12 21 12 21Z"
        />
      )}
    </Svg>
  );
}
