<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SucursalController extends Controller
{
    /**
     * Muestra una lista de todas las sucursales.
     */
    public function index()
    {
        // La lista de sucursales también es útil para el cliente
        // al momento de elegir una, por eso no la protegemos aquí.
        return response()->json(Sucursal::all());
    }

    /**
     * Almacena una nueva sucursal.
     */
    public function store(Request $request)
    {
        $datosValidados = $request->validate([
            'nombre' => 'required|string|max:255|unique:sucursales,nombre',
            'direccion' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
        ]);

        $sucursal = Sucursal::create($datosValidados);

        return response()->json($sucursal, 201); // 201 Creado
    }

    /**
     * Muestra una sucursal específica.
     */
    public function show(Sucursal $sucursal)
    {
        // Cargar los horarios de trabajo asociados a esta sucursal
        $sucursal->load('horariosTrabajo');
        return response()->json($sucursal);
    }

    /**
     * Actualiza una sucursal específica.
     */
    public function update(Request $request, Sucursal $sucursal)
    {
        $datosValidados = $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('sucursales', 'nombre')->ignore($sucursal->id)],
            'direccion' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
        ]);

        $sucursal->update($datosValidados);

        return response()->json($sucursal);
    }

    /**
     * Elimina una sucursal.
     */
    public function destroy(Sucursal $sucursal)
    {
        try {
            // Revisar si hay cupos u horarios ligados
            if ($sucursal->horariosTrabajo()->count() > 0 || $sucursal->cuposHorarios()->count() > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar, esta sucursal tiene horarios o cupos definidos.'
                ], 409); // 409 Conflicto
            }
            
            $sucursal->delete();

            return response()->json(null, 204); // 204 Sin Contenido

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar la sucursal.'
            ], 500);
        }
    }
}
