import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonCard, IonCardContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { car, water, calendar, addCircle, person } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonCard, IonCardContent, IonGrid, IonRow, IonCol],
})
export class HomePage {
  private router = inject(Router);

  constructor() {
    addIcons({ car, water, calendar, addCircle, person });
  }

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
}
