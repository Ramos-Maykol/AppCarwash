import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonMenuButton],
})
export class HomePage {
  private router = inject(Router);

  goToServices() {
    this.router.navigate(['/services']);
  }

  goToReservations() {
    this.router.navigate(['/reservations']);
  }

  goToBooking() {
    this.router.navigate(['/booking']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToVehiculos() {
    this.router.navigate(['/vehiculos']);
  }
}
