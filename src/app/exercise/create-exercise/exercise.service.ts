import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Exercise } from '../exercise.model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  private readonly url = 'http://localhost:8080/exercises';
  private http = inject(HttpClient);

  constructor() {}

  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.url);
  }

  postExercise(formData: FormData) {
    return this.http.post(this.url, formData);
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(this.url + `/${id}`);
  }

  getExerciseImage(id: number) {
    return this.http.get(this.url + `/${id}/image`, { responseType: 'blob' });
  }

  updateExercise(id: number, formData: FormData) {
    return this.http.put(this.url + `/${id}`, formData);
  }

  deleteExercise(id: number) {
    return this.http.delete(this.url + `/${id}`);
  }

}
