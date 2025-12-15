import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonMenuButton,
  IonButton,
  IonIcon 
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
    IonIcon
  ]
})
export class DashboardPage implements OnInit {
  private authService = inject(AuthService);
  
  userName: string = '';

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
  }
}