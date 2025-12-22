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
  {
    path: 'admin/empleados',
    loadComponent: () => import('./pages/admin/empleados-list/empleados-list.page').then(m => m.EmpleadosListPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/empleados/crear',
    loadComponent: () => import('./pages/admin/empleado-form/empleado-form.page').then(m => m.EmpleadoFormPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/empleados/editar/:id',
    loadComponent: () => import('./pages/admin/empleado-form/empleado-form.page').then(m => m.EmpleadoFormPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/horarios',
    loadComponent: () => import('./pages/admin/horarios/horarios.page').then(m => m.HorariosPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/sucursales',
    loadComponent: () => import('./pages/admin/sucursales-list/sucursales-list.page').then(m => m.SucursalesListPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/sucursales/crear',
    loadComponent: () => import('./pages/admin/sucursal-form/sucursal-form.page').then(m => m.SucursalFormPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/sucursales/editar/:id',
    loadComponent: () => import('./pages/admin/sucursal-form/sucursal-form.page').then(m => m.SucursalFormPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/servicios',
    loadComponent: () => import('./pages/admin/servicios/servicios.page').then(m => m.ServiciosPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/reportes',
    loadComponent: () => import('./pages/admin/reportes/reportes.page').then(m => m.ReportesPage),
    canActivate: [authGuard, adminGuard]
  },


];