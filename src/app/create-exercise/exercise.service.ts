import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  private readonly url = 'http://localhost:8080/exercises';
  private http = inject(HttpClient);

  constructor() {}


}
