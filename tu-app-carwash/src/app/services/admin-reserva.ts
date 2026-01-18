import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// --- INTERFACES QUE MAPEAN TU LARAVEL ---

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface TipoVehiculo {
  id: number;
  nombre: string; // ej: "SUV", "Sedan"
}

export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  tipo_vehiculo?: TipoVehiculo; // Relación anidada
}

export interface Servicio {
  id: number;
  nombre: string; // ej: "Lavado Completo"
}

export interface PrecioServicio {
  id: number;
  precio: number;
  servicio?: Servicio;
}

export interface CupoHorario {
  id: number;
  hora_inicio: string; // "2023-12-15 10:00:00"
  hora_fin: string;
}

export interface Reserva {
  id: number;
  estado: 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  precio_final: number; // O el campo que uses para el precio total
  cliente?: Cliente;
  vehiculo?: Vehiculo;
  precio_servicio?: PrecioServicio;
  cupo_horario?: CupoHorario;
}

export interface ReservaResponse {
  current_page: number;
  data: Reserva[];
  total: number;
  last_page: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminReservaService {
  private api = inject(ApiService);

  constructor() { }

  /**
   * Obtener reservas con filtros opcionales
   */
  getReservas(filtros?: { fecha?: string, estado?: string, page?: number }): Observable<ReservaResponse> {
    const params: Record<string, string> = {};
    if (filtros?.fecha) params['fecha'] = filtros.fecha;
    if (filtros?.estado) params['estado'] = filtros.estado;
    if (typeof filtros?.page === 'number') params['page'] = String(filtros.page);

    return this.api.get<ReservaResponse>('/admin/reservas', params);
  }

  /**
   * Actualizar estado de la reserva (PUT /api/admin/reservas/{id})
   */
  updateEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.api.put(`/admin/reservas/${id}`, { estado: nuevoEstado });
  }
}