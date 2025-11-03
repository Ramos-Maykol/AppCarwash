import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Servicio, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private apiService = inject(ApiService);

  servicios = signal<Servicio[]>([]);

  obtenerServicios(): Observable<Servicio[]> {
    return this.apiService.get<Servicio[]>('/servicios').pipe(
      tap(servicios => this.servicios.set(servicios))
    );
  }

  obtenerPrecioServicio(servicioId: number, tipoVehiculoId: number): number | null {
    const servicio = this.servicios().find(s => s.id === servicioId);
    if (!servicio || !servicio.precios_servicio) {
      return null;
    }

    const precioServicio = servicio.precios_servicio.find(
      ps => ps.tipo_vehiculo_id === tipoVehiculoId
    );

    return precioServicio ? parseFloat(precioServicio.precio) : null;
  }
}
