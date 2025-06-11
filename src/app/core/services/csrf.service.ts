import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfToken = signal<string | null>(null);
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  initializeCsrfToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/csrf/token`).pipe(
      tap((response: any) => {
        const token = this.extractTokenFromCookie();
        if (token) {
          this.csrfToken.set(token);
        }
      })
    );
  }

  private extractTokenFromCookie(): string | null {
    const xsrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
    
    return xsrfToken ? decodeURIComponent(xsrfToken) : null;
  }

  getToken(): string | null {
    return this.csrfToken();
  }

  refreshToken(): void {
    this.initializeCsrfToken().subscribe();
  }
} 