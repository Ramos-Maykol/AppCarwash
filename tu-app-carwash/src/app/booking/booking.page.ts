import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonSelect, IonSelectOption, IonDatetime, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_estimada: number;
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonSelect, IonSelectOption, IonDatetime, IonItem, IonLabel, IonText, CommonModule, ReactiveFormsModule]
})
export class BookingPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  servicio: Servicio | null = null;

  bookingForm: FormGroup = this.fb.group({
    sucursal_id: ['', Validators.required],
    vehiculo_id: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required]
  });

  sucursales = [
    // TODO: Load from API
    { id: 1, nombre: 'Sucursal Centro' },
    { id: 2, nombre: 'Sucursal Norte' }
  ];

  vehiculos = [
    // TODO: Load from API
    { id: 1, placa: 'ABC-123', tipo: 'Sedán' },
    { id: 2, placa: 'XYZ-456', tipo: 'SUV' }
  ];

  ngOnInit() {
    // Get servicio from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.servicio = navigation.extras.state['servicio'];
    }
  }

  getMinDate() {
    return new Date().toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.bookingForm.valid && this.servicio) {
      const reservaData = {
        ...this.bookingForm.value,
        servicio_id: this.servicio.id,
        fecha_hora: `${this.bookingForm.value.fecha} ${this.bookingForm.value.hora}`
      };
      console.log('Booking data:', reservaData);
      // TODO: Send to API
      // Navigate to reservations or confirmation
      this.router.navigate(['/reservations']);
    }
  }
}
