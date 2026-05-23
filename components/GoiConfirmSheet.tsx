import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD, authScreenStyles } from "../constants/authUi";
import { WORKOUT_UI, workoutScreenStyles } from "../constants/workoutScreenUi";

export type GoiConfirmButtonStyle = "default" | "cancel" | "destructive";

export type GoiConfirmButton = {
  text: string;
  style?: GoiConfirmButtonStyle;
  onPress?: () => void;
};

export type GoiConfirmSheetProps = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: GoiConfirmButton[];
  onDismiss: () => void;
};

export function GoiConfirmSheet({ visible, title, message, buttons, onDismiss }: GoiConfirmSheetProps) {
  const insets = useSafeAreaInsets();
  const cancelBtn = buttons.find((b) => b.style === "cancel");
  const dismissible = Boolean(cancelBtn);

  const handlePress = (btn: GoiConfirmButton) => {
    onDismiss();
    btn.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onDismiss : undefined}
    >
      <View style={[styles.overlay, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissible ? onDismiss : undefined}
          accessibilityLabel="Cerrar"
          accessibilityRole="button"
        />
        <View style={styles.card} accessibilityViewIsModal>
          <View style={workoutScreenStyles.cardGlowLine} />
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {title}
          </Text>
          {message ? (
            <Text style={styles.message} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            {buttons.map((btn, index) => {
              const variant = btn.style ?? "default";
              const isDestructive = variant === "destructive";
              const isCancel = variant === "cancel";
              return (
                <Pressable
                  key={`${btn.text}-${index}`}
                  onPress={() => handlePress(btn)}
                  style={({ pressed }) => [
                    styles.btn,
                    isCancel ? styles.btnCancel : null,
                    isDestructive ? styles.btnDestructive : null,
                    !isCancel && !isDestructive ? styles.btnDefault : null,
                    pressed ? workoutScreenStyles.pressed : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={btn.text}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isCancel ? styles.btnTextCancel : null,
                      isDestructive ? styles.btnTextDestructive : null,
                      !isCancel && !isDestructive ? styles.btnTextDefault : null,
                    ]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: AUTH_PAD,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    overflow: "hidden",
    backgroundColor: AUTH.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AUTH.cardBorder,
    paddingHorizontal: AUTH_PAD,
    paddingTop: 22,
    paddingBottom: 18,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    ...authScreenStyles.cardTitle,
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    ...authScreenStyles.cardSubtitle,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    width: "100%",
  },
  btn: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  btnDefault: {
    borderColor: WORKOUT_UI.borderGold,
    backgroundColor: "rgba(35, 32, 22, 0.92)",
  },
  btnCancel: {
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.65)",
  },
  btnDestructive: {
    borderColor: "rgba(248, 113, 113, 0.45)",
    backgroundColor: "rgba(48, 18, 18, 0.55)",
  },
  btnText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  btnTextDefault: {
    color: AUTH.gold,
  },
  btnTextCancel: {
    color: AUTH.muted,
    fontWeight: "600",
  },
  btnTextDestructive: {
    color: AUTH.danger,
  },
});
