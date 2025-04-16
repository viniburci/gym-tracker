import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpEvent, HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

function requestInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

  const authService = inject(AuthService);
  const token = localStorage.getItem('token');
  const expirationDate = localStorage.getItem('expiration_date');

  if (token && expirationDate && new Date(expirationDate) > new Date()) {
    const req = request.clone({
      headers: request.headers.set('Authorization', 'Bearer ' + token),
    });
    return next(req);
  } else if (token && expirationDate && new Date(expirationDate) <= new Date()) {
    console.warn('Access token expirado. Tentando renovar...');
    return authService.refreshAccessToken().pipe(
      switchMap(() => {
        const newToken = localStorage.getItem('token');
        const req = request.clone({
          headers: request.headers.set('Authorization', 'Bearer ' + newToken),
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

  return next(request);
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([requestInterceptor]))]
};
