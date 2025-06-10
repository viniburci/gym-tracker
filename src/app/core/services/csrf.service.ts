import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfToken = new BehaviorSubject<string | null>(null);
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  initializeCsrfToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/csrf/token`).pipe(
      tap((response: any) => {
        const token = this.extractTokenFromCookie();
        if (token) {
          this.csrfToken.next(token);
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
    return this.csrfToken.value;
  }

  refreshToken(): void {
    this.initializeCsrfToken().subscribe();
  }
} 