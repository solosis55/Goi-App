import { WORKOUT_SESSION_NOTES_MAX } from "../../constants/workoutSessions";
import { WorkoutNotesSheet } from "./WorkoutNotesSheet";

type WorkoutSessionNotesSheetProps = {
  visible: boolean;
  notes: string;
  disabled?: boolean;
  onChangeNotes: (text: string) => void;
  onClose: () => void;
};

export function WorkoutSessionNotesSheet({
  visible,
  notes,
  disabled,
  onChangeNotes,
  onClose,
}: WorkoutSessionNotesSheetProps) {
  return (
    <WorkoutNotesSheet
      visible={visible}
      title="Notas de sesión"
      subtitle="Sensaciones, energía o incidencias durante el entrenamiento."
      notes={notes}
      maxLength={WORKOUT_SESSION_NOTES_MAX}
      placeholder="Ej. buen día, rodilla molesta en sentadilla…"
      disabled={disabled}
      onChangeNotes={onChangeNotes}
      onClose={onClose}
    />
  );
}
