import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isAuthenticated = signal(false)

  auth = inject(AuthService);
  http = inject(HttpClient);
  exercise = signal('');

  getExercise() {
    this.http.get<{ message: string }>('http://localhost:8080/test').subscribe({
      next: (res) => {
        this.exercise.set(res.message);
      },
      error: (err) => {
        console.error('Erro ao buscar exercício:', err);
      }
    });
  }

  refresh() {
    this.auth.refreshAccessToken().subscribe({
      next: res => console.log(JSON.stringify(res))
    })
  }
}
