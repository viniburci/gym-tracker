import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly url = 'http://localhost:8080/api/v1/auth'

  private http = inject(HttpClient);

  register(firstname: string, lastname: string, email: string, password: string, role: string) {
    return this.http.post(this.url + '/register',
      {
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password,
        'role': role
      }
    )
  }

  login(email: string, password: string) {
    return this.http.post<{"accessToken": string, "refreshToken": string}>(this.url + '/authenticate',
      {
        "email": email,
        "password": password
      }
    )
  }

}
