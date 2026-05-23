import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { AccountListItem } from "../../utils/accountVault";
import { UserAvatar } from "../ui/UserAvatar";

type ProfileAccountSwitcherSheetProps = {
  visible: boolean;
  accounts: AccountListItem[];
  activeUserId: string | null;
  switchingUserId: string | null;
  onClose: () => void;
  onSelectAccount: (userId: string) => void;
  onAddAccount: () => void;
};

export function ProfileAccountSwitcherSheet({
  visible,
  accounts,
  activeUserId,
  switchingUserId,
  onClose,
  onSelectAccount,
  onAddAccount,
}: ProfileAccountSwitcherSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar selector de cuentas" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} accessibilityElementsHidden />
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Cambiar cuenta
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Elige una cuenta guardada en este dispositivo o añade otra.
        </Text>

        <View style={styles.list} accessibilityRole="list">
          {accounts.map((account) => {
            const active = account.userId === activeUserId;
            const busy = switchingUserId === account.userId;
            return (
              <Pressable
                key={account.userId}
                onPress={() => {
                  if (active || busy) return;
                  onSelectAccount(account.userId);
                }}
                disabled={active || busy}
                style={({ pressed }) => [
                  styles.row,
                  active ? styles.rowActive : null,
                  pressed && !active ? styles.rowPressed : null,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active, busy }}
                accessibilityLabel={
                  active
                    ? `Cuenta activa ${account.username}`
                    : `Cambiar a ${account.username}`
                }
              >
                <UserAvatar src={account.avatarUrl} username={account.username} size={44} />
                <View style={styles.rowMeta}>
                  <Text style={styles.rowUser} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    @{account.username}
                  </Text>
                  <Text style={styles.rowEmail} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {account.email}
                  </Text>
                </View>
                {busy ? (
                  <ActivityIndicator color={AUTH.gold} size="small" />
                ) : active ? (
                  <Text style={styles.activeMark} accessibilityLabel="Activa">
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => {
            onClose();
            onAddAccount();
          }}
          style={({ pressed }) => [styles.addBtn, pressed ? styles.rowPressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Añadir otra cuenta"
        >
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Añadir cuenta
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(212, 175, 55, 0.25)",
    paddingTop: 10,
    paddingHorizontal: 16,
    maxHeight: "72%",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(115, 115, 115, 0.9)",
    marginBottom: 14,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  list: {
    gap: 8,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
    backgroundColor: "rgba(23, 23, 23, 0.6)",
  },
  rowActive: {
    borderColor: "rgba(212, 175, 55, 0.55)",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  rowPressed: {
    opacity: 0.9,
  },
  rowMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowUser: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  rowEmail: {
    color: AUTH.muted,
    fontSize: 12,
  },
  activeMark: {
    color: AUTH.gold,
    fontSize: 18,
    fontWeight: "700",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    borderStyle: "dashed",
  },
  addIcon: {
    color: AUTH.gold,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
  addText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
});
