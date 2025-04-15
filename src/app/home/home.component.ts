import { Component, signal } from '@angular/core';
import { ProfileDropdownComponent } from "./profile-dropdown/profile-dropdown.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProfileDropdownComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isAuthenticated = signal(false)
}
