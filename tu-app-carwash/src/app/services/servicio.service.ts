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

  obtenerServicios(): Observable<ApiResponse<Servicio[]>> {
    return this.apiService.get<ApiResponse<Servicio[]>>('/servicios').pipe(
      tap(response => this.servicios.set(response.data))
    );
  }

  obtenerPrecioServicio(servicioId: number, tipoVehiculoId: number): number | null {
    const servicio = this.servicios().find(s => s.id === servicioId);
    if (!servicio || !servicio.precios_servicios) {
      return null;
    }

    const precioServicio = servicio.precios_servicios.find(
      ps => ps.tipo_vehiculo_id === tipoVehiculoId
    );

    return precioServicio ? precioServicio.precio : null;
  }
}
