export interface WorkoutExercise {
  exerciseId: number;
  sets: number;
  reps: number;
}

export interface Workout {
  id?: number;
  user: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  userEmail?: string;
}
