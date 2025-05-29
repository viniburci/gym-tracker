import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from './user.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthResponse } from './authResponse.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);
  errorMessage = signal<string | null>(null);
  private http = inject(HttpClient);

  private readonly url = environment.apiUrl;

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
          },
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

  logout(): void {
    this.user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expiration_date');
    console.log('Usuário desconectado.');

    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.isRefreshing = false;
  }

  private startRefreshTimer(expirationDate: Date): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const timeUntilRefresh = expirationDate.getTime() - new Date().getTime() - this.REFRESH_BUFFER_MS;
    if (timeUntilRefresh <= 0) {
      console.warn('O tempo para renovação já expirou no startRefreshTimer.');
      this.logout();
      return;
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken().subscribe({
        next: () => console.log('Token renovado automaticamente.'),
        error: (err) => {
          console.error('Erro ao renovar automaticamente:', err);
          this.logout();
        }
      });
    }, timeUntilRefresh);

    console.log(`Renovação de token agendada para daqui a ${timeUntilRefresh / 1000} segundos (${this.REFRESH_BUFFER_MS / 1000} segundos antes da expiração).`);
  }

  private startLogoutTimer(expirationDate: Date): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const timeUntilLogout = expirationDate.getTime() - new Date().getTime();
    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, timeUntilLogout);

    console.log(
      `Logout agendado para daqui a ${timeUntilLogout / 1000} segundos.`
    );
  }

  private startTimers(expirationDate: Date): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    this.startLogoutTimer(expirationDate);
    this.startRefreshTimer(expirationDate);
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

  autoLogin(): void {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    const expirationDateString = localStorage.getItem('expiration_date');
    const userString = localStorage.getItem('user');
    let storedUser = userString ? JSON.parse(userString) : null;

    if (!token || !expirationDateString) {
      console.log('Nenhum token ou data de expiração encontrado. Usuário não logado.');
      return;
    }

    const expirationDate = new Date(expirationDateString);

    if (expirationDate <= new Date()) {
      console.warn('Token expirado. Usuário será desconectado.');
      this.logout();
      return;
    }

    // const userData = this.decodeToken(token);
    // if (!userData) {
    //   console.error('Erro ao decodificar o token. Realizando logout.');
    //   this.logout();
    //   return;
    // }

    const user = new User(
      storedUser.id,
      storedUser.firstname,
      storedUser.lastname,
      storedUser.email,
      storedUser.role,
      token,
      refreshToken!,
      expirationDate
    );
    console.log("user auto-login id: " + user.id)
    console.log("user auto-login: " + user)

    this.user.set(user);

    console.log('Usuário autenticado automaticamente. Restaurando timers...');
    this.startTimers(expirationDate);
  }

  decodeToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload decodificado:', payload);
      return payload;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  getUserId(): number | null {
    const user = this.user();
    console.log('user:', user);
    return user ? user.id : null;
  }
}
