import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel]
})
export class NavigationMenuComponent implements AfterViewInit {
  private router = inject(Router);
  private menuController = inject(MenuController);

  @ViewChild('menu') menu!: IonMenu;

  menuItems = [
    {
      title: 'Inicio',
      icon: 'home',
      path: '/home',
      description: 'Página principal'
    },
    {
      title: 'Servicios',
      icon: 'water',
      path: '/services',
      description: 'Ver servicios disponibles'
    },
    {
      title: 'Mis Reservas',
      icon: 'calendar',
      path: '/reservations',
      description: 'Ver mis reservas'
    },
    {
      title: 'Reservar',
      icon: 'add-circle',
      path: '/booking',
      description: 'Nueva reserva'
    },
    {
      title: 'Mis Vehículos',
      icon: 'car',
      path: '/vehiculos',
      description: 'Administrar vehículos'
    },
    {
      title: 'Perfil',
      icon: 'person',
      path: '/profile',
      description: 'Mi cuenta'
    }
  ];

  ngAfterViewInit() {
    // El menú está listo para usar
  }

  onMenuItemClick(event: Event, path: string) {
    event.preventDefault(); // Prevenir comportamiento por defecto
    event.stopPropagation(); // Detener propagación

    // Cerrar el menú usando el ViewChild
    if (this.menu) {
      this.menu.close().then(() => {
        // Navegar después de que el menú se haya cerrado completamente
        setTimeout(() => {
          this.router.navigate([path]);
        }, 200); // Mayor delay para animaciones
      });
    } else {
      // Fallback al menuController
      this.menuController.close('main-menu').then(() => {
        setTimeout(() => {
          this.router.navigate([path]);
        }, 200);
      });
    }
  }

  onLogoutClick(event: Event) {
    event.preventDefault(); // Prevenir comportamiento por defecto
    event.stopPropagation(); // Detener propagación

    // Cerrar el menú usando el ViewChild
    if (this.menu) {
      this.menu.close().then(() => {
        // Navegar después de que el menú se haya cerrado completamente
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 200); // Mayor delay para animaciones
      });
    } else {
      // Fallback al menuController
      this.menuController.close('main-menu').then(() => {
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 200);
      });
    }
  }

  // Mantener los métodos anteriores por compatibilidad
  navigateTo(path: string) {
    this.onMenuItemClick(new Event('click'), path);
  }

  logout() {
    this.onLogoutClick(new Event('click'));
  }
}
