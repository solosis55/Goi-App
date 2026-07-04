import { useCallback, useState, type ReactNode } from "react";
import { View, type LayoutChangeEvent, StyleSheet } from "react-native";

type ChooserPreviewFitProps = {
  children: ReactNode;
  width: number;
};

/**
 * Escala la preview del chooser para caber en el hueco disponible (sin scroll).
 * Escala desde arriba para que no se recorte la parte inferior.
 */
export function ChooserPreviewFit({ children, width }: ChooserPreviewFitProps) {
  const [frameH, setFrameH] = useState(0);
  const [contentH, setContentH] = useState(0);

  const onFrameLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setFrameH(h);
  }, []);

  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setContentH(h);
  }, []);

  const ready = frameH > 0 && contentH > 0;
  const scale = ready ? Math.min(1, frameH / contentH) : 1;
  const displayH = ready ? contentH * scale : undefined;

  return (
    <View style={styles.frame} onLayout={onFrameLayout}>
      <View style={[styles.host, ready ? { width, height: displayH } : { width }]}>
        <View
          onLayout={onContentLayout}
          style={[
            { width },
            ready && scale < 1
              ? {
                  transform: [{ scale }],
                  transformOrigin: "top",
                }
              : null,
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    overflow: "hidden",
  },
  host: {
    overflow: "hidden",
  },
});
