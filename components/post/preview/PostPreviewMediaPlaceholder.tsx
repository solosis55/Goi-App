import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import type { PostFormat } from "../../../constants/postFormat";
import { POST_PREVIEW_CARD, previewMediaHeight } from "./postPreviewTheme";

type PostPreviewMediaPlaceholderProps = {
  width: number;
  gradientId?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  format?: PostFormat;
  /** Solo degradado (p. ej. CTA de editor encima sin icono duplicado). */
  backgroundOnly?: boolean;
};

/** Placeholder de foto para previews (selector, editor). */
export function PostPreviewMediaPlaceholder({
  width,
  gradientId = "postPreviewMediaGrad",
  style,
  compact = false,
  format = "standard",
  backgroundOnly = false,
}: PostPreviewMediaPlaceholderProps) {
  const ph = POST_PREVIEW_CARD.placeholder;
  const height = previewMediaHeight(width, format, compact);

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={ph.gradStart} stopOpacity="1" />
            <Stop offset="55%" stopColor={ph.gradMid} stopOpacity="1" />
            <Stop offset="100%" stopColor={ph.gradEnd} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill={`url(#${gradientId})`} />
      </Svg>
      {backgroundOnly ? null : (
        <>
          <View
            style={[
              styles.iconRing,
              {
                backgroundColor: ph.ring,
                borderColor: ph.ringBorder,
              },
            ]}
          >
            <Text style={styles.icon} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              📷
            </Text>
          </View>
          <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {ph.label}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(115, 115, 115, 0.2)",
  },
  iconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 8,
  },
  icon: { fontSize: 22 },
  label: { color: AUTH.faint, fontSize: 11, fontWeight: "600" },
});
