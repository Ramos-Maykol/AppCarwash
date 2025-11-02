import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, IonSpinner, IonChip
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ServicioService } from '../services/servicio.service';
import { Servicio, PrecioServicio } from '../models/interfaces';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonSpinner, IonChip
  ]
})
export class ServicesPage implements OnInit {
  private router = inject(Router);
  private servicioService = inject(ServicioService);

  servicios = this.servicioService.servicios;
  isLoading = signal(false);

  ngOnInit() {
    this.cargarServicios();
  }

  cargarServicios() {
    this.isLoading.set(true);
    this.servicioService.obtenerServicios().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  reservarServicio(servicio: Servicio) {
    this.router.navigate(['/booking'], { 
      state: { servicioId: servicio.id } 
    });
  }

  obtenerRangoPrecio(servicio: Servicio): string {
    if (!servicio.precios_servicios || servicio.precios_servicios.length === 0) {
      return 'Precio no disponible';
    }

    const precios = servicio.precios_servicios.map(ps => ps.precio);
    const min = Math.min(...precios);
    const max = Math.max(...precios);

    if (min === max) {
      return `$${min.toFixed(2)}`;
    }

    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }
}
