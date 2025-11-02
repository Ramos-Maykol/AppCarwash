import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, 
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
    IonButton, IonIcon, IonList, IonItem, IonLabel, IonAvatar
  ]
})
export class ProfilePage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  ngOnInit() {
    // User data is already loaded from auth service
  }

  goToVehiculos() {
    this.router.navigate(['/vehiculos']);
  }

  goToReservations() {
    this.router.navigate(['/reservations']);
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          // Even if API fails, clear local data
          localStorage.removeItem('auth_token');
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }
}
