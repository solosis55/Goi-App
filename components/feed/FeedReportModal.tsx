import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

const REASONS = [
  { id: "spam", label: "Spam o publicidad" },
  { id: "harassment", label: "Acoso u odio" },
  { id: "nsfw", label: "Contenido inapropiado" },
  { id: "other", label: "Otro" },
] as const;

type FeedReportModalProps = {
  visible: boolean;
  authorUsername: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function FeedReportModal({ visible, authorUsername, onClose, onSubmit }: FeedReportModalProps) {
  const insets = useSafeAreaInsets();
  const [reasonId, setReasonId] = useState<(typeof REASONS)[number]["id"]>("spam");
  const [detail, setDetail] = useState("");

  const submit = () => {
    const label = REASONS.find((r) => r.id === reasonId)?.label ?? reasonId;
    const full = detail.trim() ? `${label}: ${detail.trim()}` : label;
    onSubmit(full);
    setDetail("");
    setReasonId("spam");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Reportar publicación
        </Text>
        <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Usuario: @{authorUsername}. El informe se guarda en este dispositivo.
        </Text>
        <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Motivo
        </Text>
        <View style={styles.reasons}>
          {REASONS.map((r) => {
            const selected = reasonId === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => setReasonId(r.id)}
                style={[styles.reasonChip, selected ? styles.reasonChipActive : null]}
              >
                <Text
                  style={[styles.reasonText, selected ? styles.reasonTextActive : null]}
                  maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                >
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={detail}
          onChangeText={setDetail}
          placeholder="Detalle opcional…"
          placeholderTextColor={AUTH.faint}
          multiline
          maxLength={400}
          style={styles.input}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
        />
        <View style={styles.actions}>
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cancelar
            </Text>
          </Pressable>
          <Pressable onPress={submit} style={styles.submitBtn}>
            <Text style={styles.submitText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Enviar informe
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    marginTop: "auto",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    backgroundColor: "rgba(14, 14, 16, 0.98)",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(82, 82, 82, 0.65)",
    gap: 10,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
  },
  sub: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 4,
  },
  reasons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reasonChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.9)",
  },
  reasonChipActive: {
    borderColor: "rgba(212, 175, 55, 0.5)",
    backgroundColor: "rgba(35, 32, 22, 0.8)",
  },
  reasonText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  reasonTextActive: {
    color: AUTH.gold,
  },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    borderRadius: 10,
    padding: 12,
    color: AUTH.steel,
    fontSize: 14,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelText: {
    color: AUTH.muted,
    fontSize: 15,
    fontWeight: "600",
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: AUTH.gold,
  },
  submitText: {
    color: "#0a0a0a",
    fontSize: 15,
    fontWeight: "700",
  },
});
