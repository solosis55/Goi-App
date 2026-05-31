import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FeedScope } from "../../constants/feed";
import { feedScopeEmptyMessage } from "../../utils/feedTimeline";

type FeedEmptyStateProps = {
  scope: FeedScope;
  onCreatePost?: () => void;
  suggestionsSlot?: ReactNode;
};

function FeedEmptyIllustration() {
  return (
    <View style={styles.illusWrap} accessibilityElementsHidden>
      <Svg width={56} height={56} viewBox="0 0 56 56" fill="none">
        <Path
          d="M28 8l4.5 14H47l-11.5 8.5 4.5 14L28 36l-12 8.5 4.5-14L9 22h14.5L28 8Z"
          stroke={AUTH.gold}
          strokeWidth={1.5}
          strokeLinejoin="round"
          opacity={0.85}
        />
        <Path
          d="M18 42h20M22 48h12"
          stroke={AUTH.muted}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}

export function FeedEmptyState({ scope, onCreatePost, suggestionsSlot }: FeedEmptyStateProps) {
  const router = useRouter();
  const { title, body } = feedScopeEmptyMessage(scope);

  return (
    <View style={styles.wrap}>
      <FeedEmptyIllustration />
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>
      <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {body}
      </Text>
      {suggestionsSlot ? <View style={styles.suggestionsSlot}>{suggestionsSlot}</View> : null}
      {scope === "all" ? (
        <Pressable
          onPress={onCreatePost ?? (() => router.push("/nueva-publicacion"))}
          style={({ pressed }) => [styles.cta, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Crear publicación"
        >
          <Text style={styles.ctaText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Crear publicación
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push({ pathname: "/(tabs)/social", params: { discover: "1" } })}
          style={({ pressed }) => [styles.ctaSecondary, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Buscar atletas en Social"
        >
          <Text style={styles.ctaSecondaryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Buscar atletas en Social
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 10,
  },
  illusWrap: {
    marginBottom: 4,
    opacity: 0.9,
  },
  suggestionsSlot: {
    width: "100%",
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  cta: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: AUTH.gold,
  },
  ctaText: {
    color: "#0a0a0a",
    fontSize: 15,
    fontWeight: "700",
  },
  ctaSecondary: {
    marginTop: 8,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.5)",
  },
  ctaSecondaryText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.9,
  },
});
