import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Vehiculo, TipoVehiculo } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiService = inject(ApiService);

  vehiculos = signal<Vehiculo[]>([]);
  tiposVehiculo = signal<TipoVehiculo[]>([]);

  obtenerMisVehiculos(): Observable<Vehiculo[]> {
    return this.apiService.get<Vehiculo[]>('/vehiculos').pipe(
      tap(response => this.vehiculos.set(response))
    );
  }

  obtenerTiposVehiculo(): Observable<TipoVehiculo[]> {
    return this.apiService.get<TipoVehiculo[]>('/tipos-vehiculo').pipe(
      tap(tipos => this.tiposVehiculo.set(tipos))
    );
  }

  crearVehiculo(vehiculo: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.apiService.post<Vehiculo>('/vehiculos', vehiculo).pipe(
      tap(response => {
        const current = this.vehiculos();
        const newVehiculos = [...current, response];
        this.vehiculos.set(newVehiculos);
      })
    );
  }

  actualizarVehiculo(id: number, vehiculo: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.apiService.put<Vehiculo>(`/vehiculos/${id}`, vehiculo).pipe(
      tap(response => {
        const current = this.vehiculos();
        const index = current.findIndex(v => v.id === id);
        if (index !== -1) {
          current[index] = response;
          this.vehiculos.set([...current]);
        }
      })
    );
  }

  eliminarVehiculo(id: number): Observable<any> {
    return this.apiService.delete<any>(`/vehiculos/${id}`).pipe(
      tap(() => {
        const current = this.vehiculos();
        this.vehiculos.set(current.filter(v => v.id !== id));
      })
    );
  }
}
