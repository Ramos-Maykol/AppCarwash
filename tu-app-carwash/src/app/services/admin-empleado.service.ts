import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Cargo {
  id: number;
  nombre_cargo: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  codigo_empleado?: string | null;
  activo?: boolean;
  sucursal_id?: number | null;
  cargo_id: number;
  usuario?: {
    id: number;
    email: string;
    name: string;
  };
  cargo?: Cargo;
  sucursal?: Sucursal;
}

export interface CrearEmpleadoRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  password_confirmation: string;
  cargo_id: number;
  sucursal_id?: number | null;
  codigo_empleado?: string | null;
  activo?: boolean;
}

export interface ActualizarEmpleadoRequest {
  nombre: string;
  apellido: string;
  email: string;
  password?: string | null;
  password_confirmation?: string | null;
  cargo_id: number;
  sucursal_id?: number | null;
  codigo_empleado?: string | null;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminEmpleadoService {
  private api = inject(ApiService);

  list(): Observable<Empleado[]> {
    return this.api.get<Empleado[]>('/admin/empleados');
  }

  create(payload: CrearEmpleadoRequest): Observable<Empleado> {
    return this.api.post<Empleado>('/admin/empleados', payload);
  }

  update(id: number, payload: ActualizarEmpleadoRequest): Observable<Empleado> {
    return this.api.put<Empleado>(`/admin/empleados/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/admin/empleados/${id}`);
  }

  listCargos(): Observable<Cargo[]> {
    return this.api.get<Cargo[]>('/admin/cargos');
  }

  listSucursales(): Observable<Sucursal[]> {
    return this.api.get<Sucursal[]>('/sucursales');
  }
}
