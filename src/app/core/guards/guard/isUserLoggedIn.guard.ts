import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { map } from 'rxjs';

export const isUserLoggedInGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.autoLogin().pipe(
    map(() => {
      const user = authService.user();
      return user ? true : router.parseUrl('/login');
    })
  )

};
