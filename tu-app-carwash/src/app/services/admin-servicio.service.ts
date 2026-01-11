import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminTipoVehiculo {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface AdminPrecioServicio {
  id: number;
  servicio_id: number;
  tipo_vehiculo_id: number;
  precio: string;
  tipo_vehiculo?: AdminTipoVehiculo;
}

export interface AdminServicio {
  id: number;
  nombre: string;
  descripcion?: string | null;
  duracion_estimada_minutos: number;
  esta_activo?: boolean | number;
  precios_servicio?: AdminPrecioServicio[];
  preciosServicio?: AdminPrecioServicio[];
}

export interface GuardarServicioRequest {
  nombre: string;
  descripcion?: string | null;
  duracion_estimada_minutos: number;
  precios: Array<{
    tipo_vehiculo_id: number;
    precio: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AdminServicioService {
  private api = inject(ApiService);

  list(): Observable<AdminServicio[]> {
    return this.api.get<AdminServicio[]>('/admin/servicios');
  }

  get(id: number): Observable<AdminServicio> {
    return this.api.get<AdminServicio>(`/admin/servicios/${id}`);
  }

  create(payload: GuardarServicioRequest): Observable<AdminServicio> {
    return this.api.post<AdminServicio>('/admin/servicios', payload);
  }

  update(id: number, payload: GuardarServicioRequest): Observable<AdminServicio> {
    return this.api.put<AdminServicio>(`/admin/servicios/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/admin/servicios/${id}`);
  }

  listTiposVehiculo(): Observable<AdminTipoVehiculo[]> {
    return this.api.get<AdminTipoVehiculo[]>('/admin/tipos-vehiculo');
  }
}
