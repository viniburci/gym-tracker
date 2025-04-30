export interface Workout {
  id?: number;
  name: string;
  workoutExercises: WorkoutExercise[];
  userEmail?: string;
}

export interface WorkoutExercise {
  id?: number;
  exercise: {id: number};
  sets: number;
  reps: number;
}
