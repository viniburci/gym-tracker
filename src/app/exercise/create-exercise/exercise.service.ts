import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  private readonly url = 'http://localhost:8080/exercises';
  private http = inject(HttpClient);

  constructor() {}

  postExercise(formData: FormData) {
    return this.http.post(this.url, formData);
  }

  getExerciseById(id: number) {
    return this.http.get(this.url + `/${id}`);
  }

  getExerciseImage(id: number) {
    return this.http.get(this.url + `/${id}/image`, { responseType: 'blob' });
  }

}
