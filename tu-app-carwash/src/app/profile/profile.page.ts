import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { person, car, logOut } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel, CommonModule]
})
export class ProfilePage implements OnInit {
  private router = inject(Router);

  user = {
    name: 'Juan Pérez',
    email: 'juan@example.com'
  };

  constructor() {
    addIcons({ person, car, logOut });
  }

  ngOnInit() {
    // TODO: Load user data from API
  }

  goToReservations() {
    this.router.navigate(['/reservations']);
  }

  logout() {
    // TODO: Clear token and logout
    this.router.navigate(['/auth/login']);
  }
}
