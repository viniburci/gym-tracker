import { Component, inject, OnInit, signal } from '@angular/core';
import { User } from '../auth/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  user = signal<User | null>(null);
  private router = inject(Router);

  ngOnInit() {
    this.user.set(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null)
    if(!this.user()) {
      this.router.navigate(['/login']);
    }
  }



}
