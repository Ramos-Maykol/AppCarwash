import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { car, water } from 'ionicons/icons';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_estimada: number;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel, CommonModule]
})
export class ServicesPage implements OnInit {
  private router = inject(Router);

  servicios: Servicio[] = [
    // TODO: Load from API
    { id: 1, nombre: 'Lavado Básico', descripcion: 'Lavado exterior completo', precio: 15000, duracion_estimada: 30 },
    { id: 2, nombre: 'Lavado Premium', descripcion: 'Lavado exterior e interior', precio: 25000, duracion_estimada: 60 },
    { id: 3, nombre: 'Lavado Deluxe', descripcion: 'Lavado completo con detailing', precio: 40000, duracion_estimada: 90 }
  ];

  constructor() {
    addIcons({ car, water });
  }

  ngOnInit() {
    // TODO: Load services from API
  }

  bookService(servicio: Servicio) {
    // Pass service to booking page
    this.router.navigate(['/booking'], { state: { servicio } });
  }
}
