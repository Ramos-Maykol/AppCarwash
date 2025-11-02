// Tipos de Vehículo
export interface TipoVehiculo {
  id: number;
  nombre: string;
  descripcion?: string;
}

// Vehículo del Cliente
export interface Vehiculo {
  id: number;
  tipo_vehiculo_id: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  tipo_vehiculo?: TipoVehiculo;
}

// Precio de Servicio (Tabla Pivote)
export interface PrecioServicio {
  id: number;
  servicio_id: number;
  tipo_vehiculo_id: number;
  precio: number;
  tipo_vehiculo?: TipoVehiculo;
}

// Servicio
export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  imagen?: string;
  precios_servicios?: PrecioServicio[];
}

// Sucursal
export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  latitud?: string;
  longitud?: string;
}

// Cupo de Horario
export interface CupoHorario {
  id: number;
  sucursal_id: number;
  fecha_hora: string;
  estado: 'disponible' | 'reservado' | 'bloqueado';
  sucursal?: Sucursal;
}

// Reserva
export interface Reserva {
  id: number;
  cliente_id: number;
  vehiculo_id: number;
  servicio_id: number;
  cupo_horario_id: number;
  precio_final: number;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  observaciones?: string;
  created_at: string;
  updated_at: string;
  vehiculo?: Vehiculo;
  servicio?: Servicio;
  cupo_horario?: CupoHorario;
}

// Request para crear reserva
export interface CrearReservaRequest {
  vehiculo_id: number;
  servicio_id: number;
  cupo_horario_id: number;
  observaciones?: string;
}

// Response de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
