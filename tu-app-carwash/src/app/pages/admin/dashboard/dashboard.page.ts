import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonMenuButton,
  IonButton,
  IonIcon,
  IonRippleEffect,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import { 
  water, 
  cash, 
  calendarNumber, 
  people, 
  pricetags, 
  statsChart 
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardService, AdminDashboardStats } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonMenuButton,
    IonButton,
    IonIcon,
    IonRippleEffect,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText
  ]
})
export class DashboardPage implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  
  userName: string = '';
  isLoading = false;
  stats: AdminDashboardStats | null = null;

  constructor() {
    // Registramos los iconos que usamos en el HTML
    addIcons({ 
      water, 
      cash, 
      calendarNumber, 
      people, 
      pricetags, 
      statsChart 
    });
  }

  ngOnInit() {
    const user = this.authService.currentUser();
    // Si no hay nombre, mostramos 'Admin' por defecto
    this.userName = user?.name || 'Administrador';

    void this.loadStats();
  }

  async loadStats(event?: CustomEvent) {
    this.isLoading = true;
    this.dashboardService.getStats().pipe(
      finalize(() => {
        this.isLoading = false;
        if (event) {
          (event.target as HTMLIonRefresherElement).complete();
        }
      })
    ).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: () => {
        this.stats = null;
      }
    });
  }
}