import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  esta_activa: boolean;
}

export interface CrearSucursalRequest {
  nombre: string;
  direccion: string;
  telefono?: string | null;
  esta_activa?: boolean;
}

export interface ActualizarSucursalRequest {
  nombre: string;
  direccion: string;
  telefono?: string | null;
  esta_activa?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSucursalService {
  private api = inject(ApiService);

  listPublic(): Observable<Sucursal[]> {
    return this.api.get<Sucursal[]>('/sucursales');
  }

  get(id: number): Observable<Sucursal> {
    return this.api.get<Sucursal>(`/admin/sucursales/${id}`);
  }

  create(payload: CrearSucursalRequest): Observable<Sucursal> {
    return this.api.post<Sucursal>('/admin/sucursales', payload);
  }

  update(id: number, payload: ActualizarSucursalRequest): Observable<Sucursal> {
    return this.api.put<Sucursal>(`/admin/sucursales/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/admin/sucursales/${id}`);
  }
}
