<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HorarioTrabajo;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HorarioTrabajoController extends Controller
{
    /**
     * Muestra todos los horarios de una sucursal específica.
     */
    public function index(Request $request)
    {
        $request->validate(['sucursal_id' => 'required|integer|exists:sucursales,id']);
        
        $horarios = HorarioTrabajo::where('sucursal_id', $request->sucursal_id)
            ->orderBy('dia_semana')
            ->get();
            
        return response()->json($horarios);
    }

    /**
     * Almacena un nuevo horario de trabajo para una sucursal.
     */
    public function store(Request $request)
    {
        $datosValidados = $request->validate([
            'sucursal_id' => 'required|integer|exists:sucursales,id',
            'dia_semana' => [
                'required',
                'integer',
                'between:1,7', // 1 (Lunes) a 7 (Domingo)
                // Regla Única: No se puede definir dos horarios para el mismo día en la misma sucursal
                Rule::unique('horarios_trabajo')->where(function ($query) use ($request) {
                    return $query->where('sucursal_id', $request->sucursal_id);
                })
            ],
            'hora_inicio' => 'required|date_format:H:i', // Formato 24h ej. 09:00
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        $horario = HorarioTrabajo::create($datosValidados);

        return response()->json($horario, 201);
    }

    /**
     * Muestra un horario de trabajo específico.
     */
    public function show(HorarioTrabajo $horarioTrabajo)
    {
        return response()->json($horarioTrabajo);
    }

    /**
     * Actualiza un horario de trabajo.
     */
    public function update(Request $request, HorarioTrabajo $horarioTrabajo)
    {
        $datosValidados = $request->validate([
            // No permitimos cambiar la sucursal_id o el dia_semana en una actualización,
            // es más limpio borrar y crear uno nuevo.
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);
        
        $horarioTrabajo->update($datosValidados);

        return response()->json($horarioTrabajo);
    }

    /**
     * Elimina un horario de trabajo.
     */
    public function destroy(HorarioTrabajo $horarioTrabajo)
    {
        $horarioTrabajo->delete();
        
        // ¡Importante! Al borrar un horario, deberíamos también borrar
        // los cupos futuros 'disponibles' generados por este horario.
        // (Lógica de limpieza más avanzada)
        
        // Por ahora, solo borramos la plantilla:
        return response()->json(null, 204);
    }
}
