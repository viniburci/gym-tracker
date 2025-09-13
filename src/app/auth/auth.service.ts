import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from './user.model';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { AuthResponse } from './authResponse.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);
  errorMessage = signal<string | null>(null);
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly url = environment.apiUrl + environment.api.auth;

  private logoutTimer: any;
  private refreshTimer: any;
  private isRefreshing = false;
  private readonly REFRESH_BUFFER_MS = environment.refreshTokenBuffer;

  register(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    role: string
  ) {
    return this.http
      .post<AuthResponse>(`${this.url}/register`, {
        firstname,
        lastname,
        email,
        password,
        role,
      })
      .pipe(
        catchError((err) => this.handleErrorAndEmit(err)),
        tap((resData) => this.handleAuthentication(resData))
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.url}/authenticate`, { email, password })
      .pipe(
        catchError((err) => this.handleErrorAndEmit(err)),
        tap((resData) => this.handleAuthentication(resData))
      );
  }

  refreshAccessToken(): Observable<AuthResponse> {
    if (this.isRefreshing) {
      console.warn('Renovação de token já em andamento.');
      return throwError(() => new Error('Renovação de token em progresso.'));
    }

    this.isRefreshing = true;

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.warn('Nenhum refresh token encontrado.');
      this.isRefreshing = false;
      return throwError(() => new Error('Nenhum refresh token disponível.'));
    }

    return this.http
      .post<AuthResponse>(
        `${this.url}/refresh-token`,
        {},
        {
          headers: {
            Authorization: 'Bearer ' + refreshToken,
          }
        }
      )
      .pipe(
        tap((resData) => {
          this.handleAuthentication(resData);
          console.log('Token renovado e timers reiniciados.');
        }),
        catchError((err) => {
          console.error('Erro ao renovar o token:', err);
          this.logout();
          return throwError(() => err);
        }),
        tap(() => {
          this.isRefreshing = false; // Reseta a flag ao final
        })
      );
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expiration_date');
    localStorage.removeItem('user');
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.router.navigate(['/']);
  }

  autoLogin(): Observable<void> {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return of(void 0);
    }

    const user: User = JSON.parse(userData);
    const expirationDate = new Date(localStorage.getItem('expiration_date') || '');

    if (expirationDate <= new Date()) {
      console.log('Token expirado durante auto-login. Tentando renovar...');

      return this.refreshAccessToken().pipe(
        map(() => {
          this.user.set(user);
          this.startTimers(expirationDate);
        }),
        catchError((err) => {
          console.error('Erro ao renovar token durante auto-login:', err);
          this.logout();
          return of(void 0);
        })
      );
    }

    this.user.set(user);
    this.startTimers(expirationDate);
    return of(void 0); // ainda retorna Observable<void>
  }


  private handleAuthentication(resData: AuthResponse): void {
    const expirationDate = new Date(resData.expiration_date);

    console.log('Resposta da API:', resData);
    console.log('Dados do usuário:', resData.user);

    if (expirationDate <= new Date()) {
      console.error('Token já expirado ao autenticar.');
      this.logout();
      return;
    }

    const user = new User(
      resData.user.id,
      resData.user.firstname,
      resData.user.lastname,
      resData.user.email,
      resData.user.role,
      resData.access_token,
      resData.refresh_token,
      expirationDate
    );
    this.user.set(user);

    if (user.token) {
      localStorage.setItem('token', user.token.toString());
      localStorage.setItem('user', JSON.stringify(user));
    }
    localStorage.setItem('expiration_date', expirationDate.toISOString());
    if (user.refreshToken) {
      localStorage.setItem('refresh_token', user.refreshToken.toString());
    }

    console.log('Usuário autenticado. Configurando timers...');
    this.startTimers(expirationDate);
  }

  private handleErrorAndEmit(err: HttpErrorResponse): never {
    const errorMessage = this.handleError(err);
    console.error(errorMessage);
    this.errorMessage.set(errorMessage);
    throw new Error(errorMessage);
  }

  private handleError(err: HttpErrorResponse): string {
    switch (true) {
      case err.error instanceof ErrorEvent:
        return `Network error: ${err.error.message}`;
      case typeof err.error === 'string':
        return err.error;
      case !!err.error?.message:
        return err.error.message;
      case !!err.message:
        return err.message;
      case err.status === 0:
        return 'Unable to connect to the server';
      case err.status >= 400 && err.status < 500:
        return 'Invalid credentials or request';
      case err.status >= 500:
        return 'Server error, please try again later';
      default:
        return 'An unknown error occurred';
    }
  }

  private startTimers(expirationDate: Date) {
    this.clearTimers();

    const expiresIn = expirationDate.getTime() - new Date().getTime();
    console.log(`Token expira em ${expiresIn / 1000} segundos`);

    // Set timer to refresh token before it expires
    const refreshIn = expiresIn - this.REFRESH_BUFFER_MS;
    if (refreshIn > 0) {
      console.log(`Agendando renovação do token para ${refreshIn / 1000} segundos`);
      this.refreshTimer = setTimeout(() => {
        console.log('Iniciando renovação automática do token...');
        this.refreshAccessToken().subscribe();
      }, refreshIn);
    }

    // Set timer for auto logout
    if (expiresIn > 0) {
      console.log(`Agendando logout automático para ${expiresIn / 1000} segundos`);
      this.logoutTimer = setTimeout(() => {
        console.log('Executando logout automático...');
        this.logout();
      }, expiresIn);
    }
  }

  private clearTimers() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }
}
