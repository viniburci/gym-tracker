export interface Workout {
  name: string;
  workoutExercises: WorkoutExercise[];
  userEmail?: string;
}

export interface WorkoutExercise {
  exercise: {id: number};
  sets: number;
  reps: number;
}
