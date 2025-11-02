<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar la caché de permisos
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // --- Crear Permisos Básicos ---
        // (En un proyecto real, serías más específico)
        Permission::create(['name' => 'ver_dashboard_admin']);
        Permission::create(['name' => 'gestionar_sucursales']);
        Permission::create(['name' => 'gestionar_servicios']);
        Permission::create(['name' => 'gestionar_reservas']);
        Permission::create(['name' => 'gestionar_clientes']);
        Permission::create(['name' => 'ver_reservas_propias']);
        Permission::create(['name' => 'crear_reservas_propias']);

        // --- Crear Roles ---
        $roleAdmin = Role::create(['name' => 'admin']);
        // El rol 'admin' obtiene todos los permisos
        // (En lugar de dárselos uno por uno, le damos un "super-permiso")
        $roleAdmin->givePermissionTo(Permission::all());

        $roleEmpleado = Role::create(['name' => 'empleado']);
        $roleEmpleado->givePermissionTo([
            'ver_dashboard_admin',
            'gestionar_reservas',
        ]);

        $roleCliente = Role::create(['name' => 'cliente']);
        $roleCliente->givePermissionTo([
            'ver_reservas_propias',
            'crear_reservas_propias',
        ]);
    }
}
