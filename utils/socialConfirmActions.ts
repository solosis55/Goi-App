import type { GoiAlertOptions } from "../context/GoiAlertContext";

type ShowAlertFn = (opts: GoiAlertOptions) => void;

export function confirmUnfollow(
  showAlert: ShowAlertFn,
  username: string,
  onConfirm: () => void
): void {
  showAlert({
    title: "Dejar de seguir",
    message: `¿Dejar de seguir a @${username}?`,
    buttons: [
      { text: "Cancelar", style: "cancel" },
      { text: "Dejar de seguir", style: "destructive", onPress: onConfirm },
    ],
  });
}

export function confirmBlock(
  showAlert: ShowAlertFn,
  username: string,
  onConfirm: () => void
): void {
  showAlert({
    title: "Bloquear cuenta",
    message: `¿Bloquear a @${username}? No verás su contenido ni podrá seguirte.`,
    buttons: [
      { text: "Cancelar", style: "cancel" },
      { text: "Bloquear", style: "destructive", onPress: onConfirm },
    ],
  });
}

export function confirmMuteAuthor(
  showAlert: ShowAlertFn,
  username: string,
  onConfirm: () => void
): void {
  showAlert({
    title: "Silenciar publicaciones",
    message: `¿Silenciar a @${username}? Dejarás de ver sus posts en el feed.`,
    buttons: [
      { text: "Cancelar", style: "cancel" },
      { text: "Silenciar", style: "destructive", onPress: onConfirm },
    ],
  });
}

export function confirmUnblock(
  showAlert: ShowAlertFn,
  username: string,
  onConfirm: () => void
): void {
  showAlert({
    title: "Desbloquear",
    message: `¿Desbloquear a @${username}?`,
    buttons: [
      { text: "Cancelar", style: "cancel" },
      { text: "Desbloquear", onPress: onConfirm },
    ],
  });
}
