import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Reserva, CupoHorario, Sucursal, CrearReservaRequest, CrearReservaResponse, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiService = inject(ApiService);

  reservas = signal<Reserva[]>([]);
  sucursales = signal<Sucursal[]>([]);
  cuposDisponibles = signal<CupoHorario[]>([]);

  obtenerSucursales(): Observable<Sucursal[]> {
    return this.apiService.get<Sucursal[]>('/sucursales').pipe(
      tap(sucursales => this.sucursales.set(sucursales))
    );
  }

  obtenerCuposDisponibles(sucursalId: number, fecha: string): Observable<CupoHorario[]> {
    return this.apiService.get<CupoHorario[]>('/cupos-disponibles', {
      sucursal_id: sucursalId,
      fecha: fecha
    }).pipe(
      tap(cupos => this.cuposDisponibles.set(cupos))
    );
  }

  crearReserva(reserva: CrearReservaRequest): Observable<CrearReservaResponse> {
    return this.apiService.post<CrearReservaResponse>('/reservas', reserva).pipe(
      tap(response => {
        const current = this.reservas();
        this.reservas.set([response.reserva, ...current]);
      })
    );
  }

  obtenerMisReservas(): Observable<Reserva[]> {
    return this.apiService.get<Reserva[]>('/mis-reservas').pipe(
      tap(reservas => this.reservas.set(reservas))
    );
  }

  actualizarEstado(id: number, estado: string): Observable<{ message: string; reserva: Reserva }> {
    return this.apiService.patch<{ message: string; reserva: Reserva }>(`/reservas/${id}/estado`, { estado }).pipe(
      tap((response) => {
        const current = this.reservas();
        const index = current.findIndex(r => r.id === id);
        if (index !== -1) {
          current[index] = response.reserva;
          this.reservas.set([...current]);
        }
      })
    );
  }

  cancelarReserva(id: number): Observable<{ message: string; reserva: Reserva }> {
    return this.actualizarEstado(id, 'cancelada');
  }
}
