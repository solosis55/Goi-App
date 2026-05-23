import { Modal } from "react-native";
import { ExerciseCatalogPanel, type ExerciseCatalogPanelProps } from "./ExerciseCatalogPanel";

type ExerciseCatalogModalProps = ExerciseCatalogPanelProps & {
  visible: boolean;
};

export function ExerciseCatalogModal({ visible, onClose, ...panelProps }: ExerciseCatalogModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {visible ? <ExerciseCatalogPanel {...panelProps} onClose={onClose} /> : null}
    </Modal>
  );
}
