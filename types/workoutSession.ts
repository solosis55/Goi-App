export type WorkoutSession = {
  id: string;
  userId: string;
  workoutId: string;
  performedAt: string;
  notes: string;
  snapshot?: import("./workoutSessionSnapshot").WorkoutSessionSnapshot;
  createdAt: string;
};

export type WorkoutSessionWithTitle = WorkoutSession & {
  workoutTitle: string;
};

export type WorkoutSessionDetail = WorkoutSessionWithTitle & {
  authorUsername: string;
  authorAvatarUrl: string;
};

export type CreateWorkoutSessionInput = {
  workoutId: string;
  performedAt?: string;
  notes?: string;
  snapshot?: import("./workoutSessionSnapshot").WorkoutSessionSnapshot;
};
