import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.authToken()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!authService.isAdmin()) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
