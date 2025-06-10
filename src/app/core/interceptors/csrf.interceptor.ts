import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CsrfService } from '../services/csrf.service';

export function csrfInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const csrfService = inject(CsrfService);

  // Skip CSRF token for the token endpoint itself and GET requests
  if (request.method === 'GET' || request.url.includes('/api/csrf/token')) {
    return next(request.clone({ withCredentials: true }));
  }

  const token = csrfService.getToken();
  if (token) {
    request = request.clone({
      headers: request.headers.set('X-XSRF-TOKEN', token),
      withCredentials: true
    });
  }

  return next(request).pipe(
    tap({
      error: (error: HttpErrorResponse) => {
        if (error.status === 403 && error.error?.message?.includes('CSRF')) {
          console.error('Erro de CSRF, tentando renovar o token...');
          csrfService.refreshToken();
        }
      }
    })
  );
} 