import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import type { PostFormat } from "../../../constants/postFormat";
import { TabDumbbellIcon } from "../../navigation/TabBarIcons";

type CreatePostFormatSegmentProps = {
  value: PostFormat;
  onChange: (format: PostFormat) => void;
  compact?: boolean;
};

function SquareFormatIcon({ active }: { active: boolean }) {
  const c = active ? AUTH.gold : AUTH.muted;
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Rect x={2} y={2} width={12} height={12} rx={2} stroke={c} strokeWidth={1.5} />
    </Svg>
  );
}

export function CreatePostFormatSegment({ value, onChange, compact = false }: CreatePostFormatSegmentProps) {
  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : null]}>
      <Pressable
        onPress={() => onChange("standard")}
        style={({ pressed }) => [
          styles.tab,
          value === "standard" ? styles.tabActive : null,
          pressed ? styles.pressed : null,
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: value === "standard" }}
      >
        <SquareFormatIcon active={value === "standard"} />
        <Text
          style={[styles.label, value === "standard" ? styles.labelActive : null]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          Publicación
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("training")}
        style={({ pressed }) => [
          styles.tab,
          value === "training" ? styles.tabActiveTraining : null,
          pressed ? styles.pressed : null,
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: value === "training" }}
      >
        <TabDumbbellIcon size={16} color={value === "training" ? AUTH.gold : AUTH.muted} filled />
        <Text
          style={[styles.label, value === "training" ? styles.labelActive : null]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        >
          Training
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(18, 18, 20, 0.9)",
    borderWidth: 1,
    borderColor: AUTH.cardBorder,
  },
  wrapCompact: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: "rgba(35, 32, 22, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  tabActiveTraining: {
    backgroundColor: "rgba(35, 32, 22, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
  },
  label: {
    color: AUTH.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  labelActive: {
    color: AUTH.gold,
  },
  pressed: { opacity: 0.9 },
});
