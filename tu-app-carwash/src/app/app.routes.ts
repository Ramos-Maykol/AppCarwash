import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { LoginPage } from './auth/login/login.page';
import { RegisterPage } from './auth/register/register.page';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginPage,
  },
  {
    path: 'auth/register',
    component: RegisterPage,
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'services',
    loadComponent: () => import('./services/services.page').then((m) => m.ServicesPage),
    canActivate: [authGuard],
  },
  {
    path: 'booking',
    loadComponent: () => import('./booking/booking.page').then((m) => m.BookingPage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: 'vehiculos',
    loadComponent: () => import('./vehiculos/vehiculos.page').then((m) => m.VehiculosPage),
    canActivate: [authGuard],
  },
  {
    path: 'vehiculo-form',
    loadComponent: () => import('./vehiculo-form/vehiculo-form.page').then((m) => m.VehiculoFormPage),
    canActivate: [authGuard],
  },
  {
    path: 'reservations',
    loadComponent: () => import('./reservations/reservations.page').then((m) => m.ReservationsPage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  
  // --- CORRECCIÓN AQUÍ ---
  {
    // Antes tenías solo 'dashboard', ahora coincide con lo que pide el login
    path: 'admin/dashboard', 
    loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then( m => m.DashboardPage),
    // Recomendación: Agrega el authGuard aquí también para proteger al admin
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/reservas',
    loadComponent: () => import('./pages/admin/reservas/reservas.page').then( m => m.ReservasPage),
    canActivate: [authGuard, adminGuard]
  },


];