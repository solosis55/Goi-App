/** Fila de planificación (reps, carga, tipo de serie). */
export type WorkoutSetRow = {
  reps: string;
  weight: string;
  setType: string;
};

/** Ejercicio en la rutina con material y series. */
export type WorkoutExerciseBlock = {
  exerciseId: string;
  equipmentSlug?: string;
  laterality?: "bilateral" | "unilateral";
  sets: WorkoutSetRow[];
};

export type Workout = {
  id: string;
  userId: string;
  title: string;
  description: string;
  exerciseIds: string[];
  exerciseBlocks?: WorkoutExerciseBlock[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkoutInput = {
  title: string;
  description: string;
  exerciseIds?: string[];
  exerciseBlocks?: WorkoutExerciseBlock[];
  tags?: string[];
};

export type UpdateWorkoutInput = Partial<CreateWorkoutInput>;
