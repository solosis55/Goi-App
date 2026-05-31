import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import type { PostFormat } from "../../../constants/postFormat";
import { POST_BODY_MIN } from "../../../constants/createPost";
import { visibilityLabel } from "../../../utils/visibilityStyles";
import type { PostVisibility } from "../../../constants/createPost";

type CreatePostRequirementChipsProps = {
  format: PostFormat;
  imageCount: number;
  charCount: number;
  hasSession: boolean;
  visibility: PostVisibility;
  onPressPhoto?: () => void;
  onPressText?: () => void;
  onPressSession?: () => void;
  onPressVisibility?: () => void;
};

function ChipCheck({ done, warn }: { done: boolean; warn?: boolean }) {
  const color = done ? AUTH.success : warn ? AUTH.gold : "rgba(248, 113, 113, 0.9)";
  if (done) {
    return (
      <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
        <Path
          d="M2.5 6.2 4.8 8.5 9.5 3.5"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return <View style={[styles.chipDot, warn ? styles.chipDotWarn : styles.chipDotMissing]} />;
}

type ChipDef = {
  key: string;
  label: string;
  done: boolean;
  warn?: boolean;
  onPress?: () => void;
};

export function CreatePostRequirementChips({
  format,
  imageCount,
  charCount,
  hasSession,
  visibility,
  onPressPhoto,
  onPressText,
  onPressSession,
  onPressVisibility,
}: CreatePostRequirementChipsProps) {
  const hasPhoto = imageCount > 0;
  const hasText = charCount >= POST_BODY_MIN;

  const chips: ChipDef[] =
    format === "standard"
      ? [
          { key: "photo", label: "Foto", done: hasPhoto, onPress: onPressPhoto },
          {
            key: "text",
            label: "Texto",
            done: hasText || hasPhoto,
            warn: !hasText && hasPhoto,
            onPress: onPressText,
          },
          {
            key: "vis",
            label: visibilityLabel(visibility),
            done: true,
            onPress: onPressVisibility,
          },
        ]
      : [
          {
            key: "session",
            label: "Sesión",
            done: hasSession,
            onPress: onPressSession,
          },
          {
            key: "text",
            label: "Texto",
            done: hasText || hasPhoto,
            warn: !hasText && !hasPhoto,
            onPress: onPressText,
          },
          {
            key: "photo",
            label: imageCount > 0 ? `Foto · ${imageCount}` : "Foto opc.",
            done: hasPhoto,
            warn: !hasPhoto,
            onPress: onPressPhoto,
          },
        ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          onPress={chip.onPress}
          disabled={!chip.onPress}
          style={({ pressed }) => [
            styles.chip,
            chip.done ? styles.chipDone : chip.warn ? styles.chipWarn : styles.chipMissing,
            pressed && chip.onPress ? styles.chipPressed : null,
          ]}
          accessibilityRole={chip.onPress ? "button" : "text"}
        >
          <ChipCheck done={chip.done} warn={chip.warn} />
          <Text
            style={[
              styles.chipLabel,
              chip.done ? styles.chipLabelDone : chip.warn ? styles.chipLabelWarn : styles.chipLabelMissing,
            ]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginBottom: 6,
  },
  row: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipDone: {
    borderColor: "rgba(134, 239, 172, 0.35)",
    backgroundColor: "rgba(34, 50, 40, 0.55)",
  },
  chipWarn: {
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(35, 32, 22, 0.65)",
  },
  chipMissing: {
    borderColor: "rgba(248, 113, 113, 0.35)",
    backgroundColor: "rgba(50, 24, 24, 0.45)",
  },
  chipPressed: { opacity: 0.88 },
  chipLabel: { fontSize: 12, fontWeight: "600" },
  chipLabelDone: { color: AUTH.success },
  chipLabelWarn: { color: AUTH.gold },
  chipLabelMissing: { color: "#fca5a5" },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipDotMissing: { backgroundColor: "rgba(248, 113, 113, 0.85)" },
  chipDotWarn: { backgroundColor: AUTH.gold },
});
