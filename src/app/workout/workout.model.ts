import { Exercise } from "../exercise/exercise.model";

export interface Workout {
  id?: number;
  name: string;
  workoutExercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id?: number;
  exercise: Exercise;
  sets: number;
  reps: number;
}
