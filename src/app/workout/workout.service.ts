import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Workout } from './workout.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {

  private readonly url = 'http://localhost:8080/workouts';
  private http = inject(HttpClient);

  constructor() {}

  getAllWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.url);
  }

  getWorkoutById(id: number): Observable<Workout> {
    return this.http.get<Workout>(`${this.url}/${id}`);
  }

  getUserWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.url}/mine`);
  }

  createWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(this.url, workout);
  }

  updateWorkout(id: number, workout: Workout): Observable<Workout> {
    return this.http.put<Workout>(`${this.url}/${id}`, workout);
  }

  deleteWorkout(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  addExerciseToWorkout(workoutId: number, exerciseId: number, sets: number, reps: number): Observable<any> {
    return this.http.post<any>(`${this.url}/${workoutId}/addExercise/${exerciseId}`, null, {
      params: { sets, reps }
    });
  }

}
