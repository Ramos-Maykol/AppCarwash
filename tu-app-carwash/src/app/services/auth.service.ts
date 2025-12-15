import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

// Interfaces mejoradas para saber qué devuelve Laravel exactly
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[]; // Importante: Array de strings que viene de Laravel
  // otros campos opcionales...
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  telefono?: string;
  direccion?: string;
}

export interface AuthResponse {
  user: User; // Usamos la interfaz User en lugar de 'any'
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  // Asegúrate de que environment.apiUrl apunte a tu backend (ej: http://localhost:8000/api)
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api'; 

  // Signals
  currentUser = signal<User | null>(null);
  authToken = signal<string | null>(null);

  constructor() {
    this.loadSession();
  }

  // Cargar sesión guardada al iniciar la app (F5 safe)
  private loadSession() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token) {
      this.authToken.set(token);
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
      } catch (e) {
        console.error('Error al parsear usuario del storage', e);
        this.logout(); // Si está corrupto, limpiar todo
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    // Opcional: Llamar al backend para invalidar token
    // this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    
    this.authToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    this.router.navigate(['/auth/login']);
  }

  // --- Helpers Privados ---

  private handleAuthSuccess(response: AuthResponse) {
    this.authToken.set(response.token);
    this.currentUser.set(response.user);
    
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Intentar obtener el mensaje que manda Laravel (ej: "Credenciales inválidas")
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // --- Lógica de Roles (Computed Signals) ---

  // Retorna true si el usuario tiene el rol 'admin'
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.roles?.includes('admin') ?? false;
  }

  // Retorna true si el usuario tiene el rol 'cliente'
  isCliente(): boolean {
    const user = this.currentUser();
    return user?.roles?.includes('cliente') ?? false;
  }
}