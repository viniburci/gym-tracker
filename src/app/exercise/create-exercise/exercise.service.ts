import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Exercise } from '../exercise.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private readonly url = environment.apiUrl + environment.api.exercises;
  private http = inject(HttpClient);

  constructor() {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos. Verifique as informações enviadas.';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Acesso negado.';
          break;
        case 404:
          errorMessage = 'Exercício não encontrado.';
          break;
        case 413:
          errorMessage = 'Arquivo muito grande. Tamanho máximo: 2MB.';
          break;
        case 415:
          errorMessage = 'Tipo de arquivo não suportado.';
          break;
        case 500:
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.error?.message || 'Erro desconhecido'}`;
      }
    }
    
    console.error('Erro na requisição:', error);
    return throwError(() => new Error(errorMessage));
  }

  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.url)
      .pipe(catchError(this.handleError));
  }

  postExercise(formData: FormData) {
    return this.http.post(this.url, formData)
      .pipe(catchError(this.handleError));
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.url}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getExerciseImage(id: number) {
    return this.http.get(`${this.url}/${id}/image`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  updateExercise(id: number, formData: FormData) {
    return this.http.put(`${this.url}/${id}`, formData)
      .pipe(catchError(this.handleError));
  }

  deleteExercise(id: number) {
    return this.http.delete(`${this.url}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
