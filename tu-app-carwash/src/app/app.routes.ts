import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
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
];
