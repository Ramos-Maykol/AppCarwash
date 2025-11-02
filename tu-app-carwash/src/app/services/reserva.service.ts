import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Reserva, CupoHorario, Sucursal, CrearReservaRequest, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiService = inject(ApiService);

  reservas = signal<Reserva[]>([]);
  sucursales = signal<Sucursal[]>([]);
  cuposDisponibles = signal<CupoHorario[]>([]);

  obtenerSucursales(): Observable<ApiResponse<Sucursal[]>> {
    return this.apiService.get<ApiResponse<Sucursal[]>>('/sucursales').pipe(
      tap(response => this.sucursales.set(response.data))
    );
  }

  obtenerCuposDisponibles(sucursalId: number, fecha: string): Observable<ApiResponse<CupoHorario[]>> {
    return this.apiService.get<ApiResponse<CupoHorario[]>>('/cupos-disponibles', {
      sucursal_id: sucursalId,
      fecha: fecha
    }).pipe(
      tap(response => this.cuposDisponibles.set(response.data))
    );
  }

  crearReserva(reserva: CrearReservaRequest): Observable<ApiResponse<Reserva>> {
    return this.apiService.post<ApiResponse<Reserva>>('/reservas', reserva).pipe(
      tap(response => {
        const current = this.reservas();
        this.reservas.set([response.data, ...current]);
      })
    );
  }

  obtenerMisReservas(): Observable<ApiResponse<Reserva[]>> {
    return this.apiService.get<ApiResponse<Reserva[]>>('/mis-reservas').pipe(
      tap(response => this.reservas.set(response.data))
    );
  }

  cancelarReserva(id: number): Observable<ApiResponse<Reserva>> {
    return this.apiService.put<ApiResponse<Reserva>>(`/reservas/${id}/cancelar`, {}).pipe(
      tap(response => {
        const current = this.reservas();
        const index = current.findIndex(r => r.id === id);
        if (index !== -1) {
          current[index] = response.data;
          this.reservas.set([...current]);
        }
      })
    );
  }
}
