import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonMenuButton, IonButtons
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonMenuButton, IonButtons
  ]
})
export class ProfilePage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Usamos un signal o getter del servicio
  currentUser = this.authService.currentUser;

  ngOnInit() {
    // Los datos ya están cargados en el servicio
  }

  goToVehiculos() {
    this.router.navigate(['/vehiculos']);
  }

  goToReservations() {
    this.router.navigate(['/reservations']);
  }

  logout() {
    // CORRECCIÓN AQUÍ:
    // Ya no usamos .subscribe() porque el servicio se encarga de todo.
    // Simplemente llamamos al método.
    
    // Puedes mantener la confirmación si quieres:
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }
}