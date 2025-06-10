import { ApplicationConfig, inject } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  catchError,
  Observable,
  switchMap,
  throwError,
  tap,
} from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from './auth/auth.service';
import { routes } from './app.routes';
import { csrfInterceptor } from './core/interceptors/csrf.interceptor';

function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');
  const expirationDate = localStorage.getItem('expiration_date');

  // Clone the request with necessary headers
  let modifiedRequest = request;

  // Add Authorization header if token exists and is valid
  if (token && expirationDate && new Date(expirationDate) > new Date()) {
    modifiedRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
      withCredentials: true,
    });
  }

  // Handle token expiration
  if (token && expirationDate && new Date(expirationDate) <= new Date()) {
    console.warn('Access token expirado. Tentando renovar...');
    
    return authService.refreshAccessToken().pipe(
      switchMap(() => {
        const newToken = localStorage.getItem('token');
        const req = modifiedRequest.clone({
          headers: modifiedRequest.headers.set('Authorization', `Bearer ${newToken}`),
          withCredentials: true,
        });
        return next(req);
      }),
      catchError((err) => {
        console.error('Erro ao renovar o token:', err);
        authService.logout();
        return throwError(() => err);
      })
    );
  }

  // Return the request with response handling
  return next(modifiedRequest).pipe(
    tap({
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Erro de autenticação:', error);
          authService.logout();
        }
      }
    })
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      })
    ),
    provideHttpClient(
      withInterceptors([authInterceptor, csrfInterceptor])
    ),
    provideAnimationsAsync(),
  ],
};
