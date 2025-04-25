export interface WorkoutExercise {
  exerciseId: number;
  sets: number;
  reps: number;
}

export interface Workout {
  id?: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  userEmail?: string;
}
