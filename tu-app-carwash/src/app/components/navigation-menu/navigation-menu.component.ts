import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service'; // <--- IMPORTANTE

@Component({
  selector: 'app-navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel]
})
export class NavigationMenuComponent implements AfterViewInit, OnInit {
  private router = inject(Router);
  private menuController = inject(MenuController);
  private authService = inject(AuthService); // <--- Inyectamos el servicio

  @ViewChild('menu') menu!: IonMenu;

  // Esta es la lista que se mostrará en el HTML (se llena dinámicamente)
  displayMenuItems: any[] = [];

  // Menú para Clientes
  private customerItems = [
    { title: 'Inicio', icon: 'home', path: '/home', description: 'Página principal' },
    { title: 'Servicios', icon: 'water', path: '/services', description: 'Ver servicios disponibles' },
    { title: 'Mis Reservas', icon: 'calendar', path: '/reservations', description: 'Ver mis reservas' },
    { title: 'Reservar', icon: 'add-circle', path: '/booking', description: 'Nueva reserva' },
    { title: 'Mis Vehículos', icon: 'car', path: '/vehiculos', description: 'Administrar vehículos' },
    { title: 'Perfil', icon: 'person', path: '/profile', description: 'Mi cuenta' }
  ];

  // Menú para Administradores
  private adminItems = [
    { title: 'Panel Admin', icon: 'stats-chart', path: '/admin/dashboard', description: 'Resumen general' },
    { title: 'Todas las Reservas', icon: 'calendar-number', path: '/admin/reservas', description: 'Agenda global' },
    { title: 'Empleados', icon: 'people', path: '/admin/empleados', description: 'Gestión de personal' },
    { title: 'Servicios', icon: 'pricetags', path: '/admin/servicios', description: 'Configurar precios' },
    { title: 'Mi Perfil', icon: 'person', path: '/profile', description: 'Configuración de cuenta' }
  ];

  ngOnInit() {
    this.buildMenu();
  }

  ngAfterViewInit() {
    // El menú está listo para usar
  }

  // Decide qué menú mostrar basado en el rol
  buildMenu() {
    if (this.authService.isAdmin()) {
      this.displayMenuItems = this.adminItems;
    } else {
      this.displayMenuItems = this.customerItems;
    }
  }

  onMenuItemClick(event: Event, path: string) {
    event.preventDefault();
    event.stopPropagation();

    this.closeMenuAndExecute(() => {
      this.router.navigate([path]);
    });
  }

  onLogoutClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.closeMenuAndExecute(() => {
      // Usamos el método logout del servicio para borrar tokens
      this.authService.logout(); 
    });
  }

  // Helper para cerrar el menú y luego ejecutar una acción
  private closeMenuAndExecute(action: () => void) {
    if (this.menu) {
      this.menu.close().then(() => {
        setTimeout(action, 200);
      });
    } else {
      this.menuController.close('main-menu').then(() => {
        setTimeout(action, 200);
      });
    }
  }

  // Métodos de compatibilidad
  navigateTo(path: string) {
    this.onMenuItemClick(new Event('click'), path);
  }

  logout() {
    this.onLogoutClick(new Event('click'));
  }
}