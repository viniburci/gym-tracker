import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from './user.model';
import { catchError, tap, throwError } from 'rxjs';
import { AuthResponse } from './authResponse.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);
  errorMessage = signal<string | null>(null);

  private readonly url = 'http://localhost:8080/api/v1/auth';

  private http = inject(HttpClient);

  register(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    role: string
  ) {
    return this.http
      .post<AuthResponse>(this.url + '/register', {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        role: role,
      })
      .pipe(
        catchError(err => {
          const errorMessage = this.handleError(err);
          console.error(errorMessage);
          this.errorMessage.set(errorMessage);
          return throwError(() => new Error(errorMessage));
        }),
        tap((resData) => {
          this.handleAuthentication(resData);
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(this.url + '/authenticate', {
        email: email,
        password: password,
      })
      .pipe(
        catchError(err =>
          {
            const errorMessage = this.handleError(err);
            console.error(errorMessage);
            this.errorMessage.set(errorMessage);
            return throwError(() => new Error(errorMessage));
          }
        ),
        tap((resData) => {
          this.handleAuthentication(resData);
        })
      );
  }

  private handleAuthentication(resData: AuthResponse) {
    const user = new User(
      resData.user.firstname,
      resData.user.lastname,
      resData.user.email,
      resData.user.role,
      resData.access_token,
      resData.refresh_token,
      new Date(resData.expiration_date)
    );
    this.user.set(user);
  }

    private handleError(err: HttpErrorResponse): string {
      switch (true) {
        case err.error instanceof ErrorEvent:
          // Erro de rede ou erro do lado do cliente
          return `Network error: ${err.error.message}`;

        case typeof err.error === 'string':
          // Quando o backend retorna apenas uma string de erro
          return err.error;

        case !!err.error?.message:
          // Quando o backend retorna um objeto com propriedade 'message'
          return err.error.message;

        case !!err.message:
          // Mensagem padrão do HttpErrorResponse
          return err.message;

        case err.status === 0:
          // Servidor não respondeu (CORS, offline, etc)
          return 'Unable to connect to the server';

        case err.status >= 400 && err.status < 500:
          // Erros 4xx (client errors)
          return 'Invalid credentials or request';

        case err.status >= 500:
          // Erros 5xx (server errors)
          return 'Server error, please try again later';

        default:
          return 'An unknown error occurred';
      }
    }
}
