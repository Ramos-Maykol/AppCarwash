import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Vehiculo, TipoVehiculo, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiService = inject(ApiService);

  vehiculos = signal<Vehiculo[]>([]);
  tiposVehiculo = signal<TipoVehiculo[]>([]);

  obtenerMisVehiculos(): Observable<ApiResponse<Vehiculo[]>> {
    return this.apiService.get<ApiResponse<Vehiculo[]>>('/vehiculos').pipe(
      tap(response => this.vehiculos.set(response.data))
    );
  }

  obtenerTiposVehiculo(): Observable<ApiResponse<TipoVehiculo[]>> {
    return this.apiService.get<ApiResponse<TipoVehiculo[]>>('/tipos-vehiculo').pipe(
      tap(response => this.tiposVehiculo.set(response.data))
    );
  }

  crearVehiculo(vehiculo: Partial<Vehiculo>): Observable<ApiResponse<Vehiculo>> {
    return this.apiService.post<ApiResponse<Vehiculo>>('/vehiculos', vehiculo).pipe(
      tap(response => {
        const current = this.vehiculos();
        this.vehiculos.set([...current, response.data]);
      })
    );
  }

  actualizarVehiculo(id: number, vehiculo: Partial<Vehiculo>): Observable<ApiResponse<Vehiculo>> {
    return this.apiService.put<ApiResponse<Vehiculo>>(`/vehiculos/${id}`, vehiculo).pipe(
      tap(response => {
        const current = this.vehiculos();
        const index = current.findIndex(v => v.id === id);
        if (index !== -1) {
          current[index] = response.data;
          this.vehiculos.set([...current]);
        }
      })
    );
  }

  eliminarVehiculo(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<ApiResponse<any>>(`/vehiculos/${id}`).pipe(
      tap(() => {
        const current = this.vehiculos();
        this.vehiculos.set(current.filter(v => v.id !== id));
      })
    );
  }
}
