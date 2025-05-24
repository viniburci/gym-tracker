import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-home',
    imports: [RouterModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
  isAuthenticated = signal(false)

  auth = inject(AuthService);
  http = inject(HttpClient);
  exercise = signal('');

}
