import { WORKOUT_TITLE_MIN } from "../constants/workoutFormLimits";

type Args = {
  titleTrim: string;
  exerciseCount: number;
  saving: boolean;
  canSave: boolean;
};

/** Mensaje corto para el footer cuando guardar no está disponible. */
export function workoutEditorSaveBlockReason({
  titleTrim,
  exerciseCount,
  saving,
  canSave,
}: Args): string | null {
  if (saving || canSave) return null;
  if (titleTrim.length === 0) return "Escribe un título para guardar";
  if (titleTrim.length < WORKOUT_TITLE_MIN) {
    return `El título necesita al menos ${WORKOUT_TITLE_MIN} caracteres`;
  }
  if (exerciseCount === 0) return "Añade al menos un ejercicio";
  return null;
}
