import { Component, inject } from '@angular/core';
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
export class NavigationMenuComponent {
  private router = inject(Router);
  private menuController = inject(MenuController);

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

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.menuController.close('main-menu');
  }

  logout() {
    // Aquí iría la lógica de logout
    this.router.navigate(['/auth/login']);
    this.menuController.close('main-menu');
  }
}
