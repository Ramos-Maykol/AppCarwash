import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendar, time, checkmarkCircle } from 'ionicons/icons';

interface Reserva {
  id: number;
  servicio: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  sucursal: string;
  vehiculo: string;
}

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButton, IonIcon, CommonModule]
})
export class ReservationsPage implements OnInit {
  reservas: Reserva[] = [
    // TODO: Load from API
    {
      id: 1,
      servicio: 'Lavado Premium',
      fecha: '2024-01-15',
      hora: '10:00',
      estado: 'confirmada',
      sucursal: 'Sucursal Centro',
      vehiculo: 'ABC-123'
    },
    {
      id: 2,
      servicio: 'Lavado Básico',
      fecha: '2024-01-20',
      hora: '14:30',
      estado: 'pendiente',
      sucursal: 'Sucursal Norte',
      vehiculo: 'XYZ-456'
    }
  ];

  constructor() {
    addIcons({ calendar, time, checkmarkCircle });
  }

  ngOnInit() {
    // TODO: Load reservations from API
  }

  getEstadoColor(estado: string) {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'confirmada': return 'primary';
      case 'completada': return 'success';
      case 'cancelada': return 'danger';
      default: return 'medium';
    }
  }
}
