export type WorkoutSessionSnapshotSubStep = {
  weight: string;
  reps: string;
};

export type WorkoutSessionSnapshotSet = {
  done: boolean;
  plannedReps: string;
  plannedWeight: string;
  actualReps: string;
  actualWeight: string;
  rpe?: string;
  setType?: string;
  workDurationSec?: string;
  miniRestSec?: string;
  subSteps?: WorkoutSessionSnapshotSubStep[];
};

export type WorkoutSessionSnapshotBlock = {
  exerciseId: string;
  exerciseName: string;
  notes?: string;
  equipmentSlug?: string;
  laterality?: "bilateral" | "unilateral";
  sets: WorkoutSessionSnapshotSet[];
};

export type WorkoutSessionSnapshot = {
  workoutTitle: string;
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
  durationSec?: number;
  volumeKg?: number;
  blocks: WorkoutSessionSnapshotBlock[];
};
