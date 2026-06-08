import { Pressable, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { feedSuggestionsStyles as styles } from "./feedSuggestionsStyles";

type FeedSuggestionsSectionHeaderProps = {
  title: string;
  subtitle: string;
  onDismissPress?: () => void;
  onSeeAll?: () => void;
  onManageInSocial?: () => void;
};

export function FeedSuggestionsSectionHeader({
  title,
  subtitle,
  onDismissPress,
  onSeeAll,
  onManageInSocial,
}: FeedSuggestionsSectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {title}
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.headerActions}>
        {onManageInSocial ? (
          <Pressable
            onPress={onManageInSocial}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Gestionar sugerencias en Social"
            style={({ pressed }) => [styles.seeAllBtn, pressed ? styles.pressed : null]}
          >
            <Text style={styles.seeAllText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              En Social
            </Text>
          </Pressable>
        ) : null}
        {onSeeAll ? (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Ver todas las sugerencias"
            style={({ pressed }) => [styles.seeAllBtn, pressed ? styles.pressed : null]}
          >
            <Text style={styles.seeAllText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Ver todos
            </Text>
          </Pressable>
        ) : null}
        {onDismissPress ? (
          <Pressable
            onPress={onDismissPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Opciones de sugerencias"
            style={({ pressed }) => [styles.dismissBtn, pressed ? styles.pressed : null]}
          >
            <Text style={styles.dismissText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              ×
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
