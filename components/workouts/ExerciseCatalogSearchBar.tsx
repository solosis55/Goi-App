import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { exerciseCatalogStyles as s } from "../../constants/exerciseCatalogUi";

type ExerciseCatalogSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function ExerciseCatalogSearchBar({ value, onChangeText }: ExerciseCatalogSearchBarProps) {
  return (
    <View style={s.searchWrap}>
      <Text style={s.searchIcon} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        ⌕
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar movimiento…"
        placeholderTextColor={AUTH.faint}
        style={s.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Buscar en el catálogo"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={8}
          style={s.searchClear}
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
        >
          <Text style={s.searchClearText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            ×
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
