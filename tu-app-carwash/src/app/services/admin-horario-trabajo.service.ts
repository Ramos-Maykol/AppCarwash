import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface HorarioTrabajo {
  id: number;
  sucursal_id: number;
  dia_semana: number; // 1..7
  hora_inicio: string; // HH:mm or HH:mm:ss (API)
  hora_fin: string;
}

export interface CrearHorarioTrabajoRequest {
  sucursal_id: number;
  dia_semana: number;
  hora_inicio: string; // HH:mm
  hora_fin: string; // HH:mm
}

export interface ActualizarHorarioTrabajoRequest {
  hora_inicio: string;
  hora_fin: string;
}

export interface HorarioTrabajoBatchRequest {
  sucursal_id: number;
  horarios: Array<{
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AdminHorarioTrabajoService {
  private api = inject(ApiService);

  listBySucursal(sucursalId: number): Observable<HorarioTrabajo[]> {
    return this.api.get<HorarioTrabajo[]>('/admin/horarios-trabajo', { sucursal_id: sucursalId });
  }

  create(payload: CrearHorarioTrabajoRequest): Observable<HorarioTrabajo> {
    return this.api.post<HorarioTrabajo>('/admin/horarios-trabajo', payload);
  }

  update(id: number, payload: ActualizarHorarioTrabajoRequest): Observable<HorarioTrabajo> {
    return this.api.put<HorarioTrabajo>(`/admin/horarios-trabajo/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/admin/horarios-trabajo/${id}`);
  }

  sync(payload: HorarioTrabajoBatchRequest): Observable<{ data: HorarioTrabajo[]; count: number }> {
    return this.api.post<{ data: HorarioTrabajo[]; count: number }>('/admin/horarios-trabajo', payload);
  }
}
