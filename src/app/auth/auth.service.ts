import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly url = 'http://localhost:8080/api/v1/auth'

  private http = inject(HttpClient);

  signup(email: string, password: string) {
    return this.http.post<{"accessToken": string, "refreshToken": string}>(this.url + '/authenticate',
      {
        "email": email,
        "password": password
      }
    )
  }

}
