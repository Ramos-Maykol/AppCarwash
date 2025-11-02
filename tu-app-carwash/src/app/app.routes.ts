import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'services',
    loadComponent: () => import('./services/services.page').then((m) => m.ServicesPage),
  },
  {
    path: 'booking',
    loadComponent: () => import('./booking/booking.page').then((m) => m.BookingPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'reservations',
    loadComponent: () => import('./reservations/reservations.page').then((m) => m.ReservationsPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
