import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonItem, IonLabel, IonCard, IonCardContent, IonSpinner, IonMenuButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { VehiculoService } from '../services/vehiculo.service';
import { Vehiculo } from '../models/interfaces';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardContent,
    IonButton, IonIcon, IonSpinner, IonMenuButton, IonButtons
  ]
})
export class VehiculosPage implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private router = inject(Router);

  vehiculos = this.vehiculoService.vehiculos;
  isLoading = signal(false);

  ngOnInit() {
    this.cargarDatos();
  }

  // Se ejecuta cada vez que se vuelve a esta página
  ionViewWillEnter() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading.set(true);

    this.vehiculoService.obtenerMisVehiculos().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  irAFormulario(vehiculo?: Vehiculo) {
    if (vehiculo) {
      // Navegar a edición con state
      this.router.navigate(['/vehiculo-form'], {
        state: { vehiculo }
      });
    } else {
      // Navegar a creación
      this.router.navigate(['/vehiculo-form']);
    }
  }

  eliminarVehiculo(id: number) {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.isLoading.set(true);
      this.vehiculoService.eliminarVehiculo(id).subscribe({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false)
      });
    }
  }

  getVehiculoIcon(tipoVehiculoId: number): string {
    switch (tipoVehiculoId) {
      case 1:
        return 'car-outline'; // Auto
      case 2:
        return 'car-sport-outline'; // Camioneta/SUV
      case 3:
        return 'bicycle-outline'; // Moto
      default:
        return 'car-outline'; // Default
    }
  }
}
