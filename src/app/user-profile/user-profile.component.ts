import { Component, OnInit, signal } from '@angular/core';
import { User } from '../auth/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  user = signal<User | null>(null);

  ngOnInit() {
    this.user.set(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null)
  }



}
