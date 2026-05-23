import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { nuevaHistoriaHref } from "../../constants/storyRoutes";

type CreateContentSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function hapticLight() {
  if (Platform.OS === "web") return;
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* sin módulo nativo */
  }
}

export function CreateContentSheet({ visible, onClose }: CreateContentSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goPost = useCallback(() => {
    hapticLight();
    onClose();
    router.push("/nueva-publicacion");
  }, [onClose, router]);

  const goStory = useCallback(() => {
    hapticLight();
    onClose();
    router.push(nuevaHistoriaHref(true));
  }, [onClose, router]);

  const goWorkout = useCallback(() => {
    hapticLight();
    onClose();
    router.push("/rutina/nueva");
  }, [onClose, router]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar menú de creación" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Crear
        </Text>
        <Text style={styles.sheetSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Elige qué quieres compartir con la comunidad.
        </Text>

        <Pressable
          onPress={goPost}
          accessibilityRole="button"
          accessibilityLabel="Nueva publicación"
          style={({ pressed }) => [styles.option, pressed ? styles.optionPressed : null]}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionEmoji}>✎</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Publicación
            </Text>
            <Text style={styles.optionDesc} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Texto, idea o entrenamiento en el feed
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={goStory}
          accessibilityRole="button"
          accessibilityLabel="Nueva historia"
          style={({ pressed }) => [styles.option, pressed ? styles.optionPressed : null]}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionEmoji}>◎</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Historia
            </Text>
            <Text style={styles.optionDesc} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Momentos del gym que desaparecen en 24 h
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={goWorkout}
          accessibilityRole="button"
          accessibilityLabel="Nueva rutina de entrenamiento"
          style={({ pressed }) => [styles.option, pressed ? styles.optionPressed : null]}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionEmoji}>🏋</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Rutina
            </Text>
            <Text style={styles.optionDesc} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Plantilla con ejercicios, series y cargas
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={onClose} style={styles.cancelBtn} accessibilityRole="button" accessibilityLabel="Cancelar">
          <Text style={styles.cancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Cancelar
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(38, 38, 38, 0.95)",
    backgroundColor: "rgba(10, 10, 12, 0.98)",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(115, 115, 115, 0.8)",
    marginBottom: 14,
  },
  sheetTitle: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sheetSubtitle: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionPressed: {
    opacity: 0.85,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(35, 32, 22, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionEmoji: {
    color: AUTH.gold,
    fontSize: 20,
    fontWeight: "600",
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
  },
  optionDesc: {
    marginTop: 2,
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: AUTH.muted,
    fontSize: 16,
    fontWeight: "600",
  },
});
