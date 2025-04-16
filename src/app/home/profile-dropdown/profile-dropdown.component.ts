import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './profile-dropdown.component.html',
  styleUrl: './profile-dropdown.component.css'
})
export class ProfileDropdownComponent {
  isDropdownVisible = signal(false);
  private authService = inject(AuthService);

  toggleDropdown() {
    this.isDropdownVisible.set(!this.isDropdownVisible());
  }

  logout() {
    this.authService.logout();
  }

}
