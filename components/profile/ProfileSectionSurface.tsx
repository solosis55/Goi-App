import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

type ProfileSectionSurfaceProps = {
  children: ReactNode;
  style?: ViewStyle;
};

/** Bloque con fondo suave en lugar de otra línea hairline. */
export function ProfileSectionSurface({ children, style }: ProfileSectionSurfaceProps) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: "rgba(10, 10, 12, 0.55)",
    marginBottom: 2,
  },
});
