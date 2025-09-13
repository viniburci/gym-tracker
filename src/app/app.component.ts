import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ProfileDropdownComponent } from "./home/profile-dropdown/profile-dropdown.component";
import { AuthService } from './auth/auth.service';
import { CsrfService } from './core/services/csrf.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterModule, ProfileDropdownComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'gym-tracker';

  private router = inject(Router);
  private authService = inject(AuthService);
  private csrfService = inject(CsrfService);

  private isLoggedIn() {
    return this.authService.user() !== null;
  }

  shouldShowNavbar = computed(() => {
    const user = this.authService.user();
    const hiddenRoutes = ['/login', '/signup'];
    return user !== null && !hiddenRoutes.includes(this.router.url);
  });

  ngOnInit(): void {
    this.authService.autoLogin().subscribe();
    this.csrfService.initializeCsrfToken().subscribe();
  }
}
