import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { GoiGoldFadeLine } from "../ui/GoiGoldFadeLine";

type ProfileSectionSurfaceProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Línea dorada superior; desactivar en bloques anidados si molesta. */
  goldLine?: boolean;
  /** Sin márgenes laterales (feed, perfil propio). */
  flush?: boolean;
};

/** Panel con fondo suave (secciones de perfil). */
export function ProfileSectionSurface({
  children,
  style,
  goldLine = true,
  flush = false,
}: ProfileSectionSurfaceProps) {
  return (
    <View style={[styles.outer, flush ? styles.outerFlush : null, style]}>
      <View style={styles.surface}>
        {goldLine ? <GoiGoldFadeLine variant="subtle" thickness={1} /> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  outerFlush: {
    marginHorizontal: 0,
  },
  surface: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.4)",
    backgroundColor: "rgba(10, 10, 12, 0.55)",
  },
});
