import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-profile-dropdown',
    imports: [RouterModule],
    templateUrl: './profile-dropdown.component.html',
    styleUrl: './profile-dropdown.component.css'
})
export class ProfileDropdownComponent {
  isDropdownVisible = signal(false);
  private authService = inject(AuthService);

  toggleDropdown() {
    this.isDropdownVisible.set(!this.isDropdownVisible());
  }

  closeDropdown(dropdown: HTMLDetailsElement) {
    dropdown.removeAttribute('open'); // Fechar o dropdown
  }

  logout() {
    this.authService.logout();
  }

}
