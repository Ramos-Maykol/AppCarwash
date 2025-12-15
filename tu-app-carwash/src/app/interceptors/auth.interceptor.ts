import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. IMPORTANTE: Usamos el mismo nombre que en tu AuthService ('auth_token')
  const token = localStorage.getItem('auth_token');

  let authReq = req;

  // 2. Si hay token, lo inyectamos
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 3. Manejamos errores globales (ej: si el token expiró)
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Si el token expiró o es inválido, borramos todo y mandamos al login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};