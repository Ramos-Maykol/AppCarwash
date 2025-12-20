# AppCarwash (Laravel API + Ionic/Angular App)

Repositorio monorepo con:

- **Backend**: Laravel (PHP 8.2) + Sanctum + Spatie Permissions
- **Frontend**: Ionic + Angular (Standalone) + Capacitor

---

## Requisitos

- **PHP** 8.2+
- **Composer** 2+
- **Node.js** 18+
- **Ionic CLI** (recomendado)
- **Git**

---

## Backend (Laravel) - Instalación

Ruta: `carwash_api/`

1) Instalar dependencias

```bash
composer install
```

2) Configurar entorno

```bash
cp .env.example .env
php artisan key:generate
```

3) Configurar la base de datos en `.env` (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD)

4) Migrar y sembrar datos

```bash
php artisan migrate --seed
```

5) Levantar servidor

```bash
php artisan serve
```

API base (por defecto):

- `http://127.0.0.1:8000/api`

### Seeders incluidos (arranque desde cero)

`DatabaseSeeder` ejecuta:

- `RolesAndPermissionsSeeder` (Spatie roles/permisos)
- `AdminUserSeeder` (admin + perfil empleado)
- `SucursalSeeder` (sucursal + horarios)
- `CatalogoSeeder` (tipos de vehículo + servicios + precios)

### Credenciales de acceso (Seeder)

- **Admin**
  - Email: `admin@test.com`
  - Password: `password`

---

## Frontend (Ionic + Angular) - Instalación

Ruta: `tu-app-carwash/`

1) Instalar dependencias

```bash
npm install
```

2) Configurar API URL

- `src/environments/environment.ts` (dev)
- `src/environments/environment.prod.ts` (prod)

Por defecto apuntan a:

- `http://127.0.0.1:8000/api`

3) Levantar en modo desarrollo

```bash
ionic serve
```

---

## Verificación rápida (Smoke Test)

1) Inicia backend (`php artisan serve`).
2) Inicia frontend (`ionic serve`).
3) Login como admin:
   - `admin@test.com` / `password`
4) Flujo cliente:
   - Registrar cliente
   - Crear reserva
   - Cancelar reserva (solo si está pendiente y fecha/hora futura)
5) Flujo admin/empleado:
   - Cambiar estado de reserva a `en_proceso` o `completada`

---

## Notas de despliegue

- Ajusta `environment.prod.ts` con tu dominio real de API antes de publicar la app.
- Asegúrate de configurar CORS en Laravel si consumirás la API desde un dominio distinto.
