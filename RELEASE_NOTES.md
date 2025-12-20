# AppCarwash — Release Notes v1.0.0

## Resumen del Lanzamiento

La versión **v1.0.0** marca la primera versión **estable y lista para producción** de **AppCarwash**, un sistema completo de reservas para carwash con API en Laravel y aplicación Ionic/Angular.

Incluye el flujo end-to-end de autenticación, catálogo, disponibilidad de cupos, creación/cancelación de reservas y panel administrativo, con control de acceso basado en roles.

---

## Nuevas Funcionalidades (Features)

- **Sistema de Reservas (Cliente)**
  - Creación de reservas con validación de:
    - Propiedad del vehículo.
    - Disponibilidad de cupo horario.
    - Precio dinámico por tipo de vehículo (servicio + tipo de vehículo).
  - Validación anti-fechas pasadas (backend) para evitar reservas inválidas.

- **Gestión de Estados de Reserva (Workflow)**
  - Soporte de estados: **pendiente**, **confirmada**, **en_proceso**, **completada**, **cancelada**.
  - Endpoint de actualización de estado:
    - `PATCH /api/reservas/{id}/estado`
  - Reglas por rol:
    - Cliente: puede **cancelar** su propia reserva si la fecha/hora es futura.
    - Admin/Empleado: puede mover una reserva a **en_proceso** o **completada**.

- **Panel Administrativo protegido por roles**
  - Roles y permisos implementados con **Spatie Permissions**.
  - API administrativa bajo middleware `auth:sanctum` + `role:admin`.
  - Frontend protegido con guards:
    - `authGuard` (token)
    - `adminGuard` (rol admin)

- **Historial de reservas (Cliente) con indicadores visuales**
  - Lista de reservas con badge de estado y colores:
    - Pendiente: amarillo
    - Confirmada / En Proceso: azul
    - Completada: verde
    - Cancelada: rojo
  - Botón **Cancelar** visible solo si la reserva está pendiente y es futura.

---

## Correcciones de Errores (Bug Fixes)

- **Registro (payload inconsistente)**
  - Corregido el conflicto entre `name` vs `nombre/apellido`.
  - Backend ahora acepta ambos formatos de registro y normaliza el nombre.

- **Flujo de reservas (ID incorrecto)**
  - Corregido el envío incorrecto de `servicio.id` como `precio_servicio_id`.
  - Frontend ahora resuelve y envía el `precio_servicio_id` real (`precio_servicios.id`).

- **Seguridad en rutas admin (Frontend)**
  - Parche aplicado para impedir que usuarios cliente naveguen manualmente a rutas `/admin/*`.
  - Redirección automática fuera de rutas admin cuando el rol no es `admin`.

- **Normalización de nombres de columnas en BD**
  - Unificado el uso de `duracion_estimada_minutos` en modelo/controladores/seeders.

---

## Instrucciones de Actualización (Upgrading)

1) Actualizar dependencias y ejecutar migraciones/seeders:

```bash
php artisan migrate --seed
```

2) Credenciales iniciales para pruebas (Seeder):

- **Admin**
  - Email: `admin@test.com`
  - Password: `password`

3) Verificar que el Frontend apunte al backend correcto:

- `tu-app-carwash/src/environments/environment.ts`
- `tu-app-carwash/src/environments/environment.prod.ts`

---

## Notas

- Para compilar el frontend en producción se recomienda:

```bash
ionic build --prod
```

- Ajusta `environment.prod.ts` con el dominio real de tu API antes de desplegar.
