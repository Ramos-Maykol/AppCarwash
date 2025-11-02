<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CupoHorario;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CupoHorarioController extends Controller
{
    /**
     * Muestra los cupos de horarios disponibles.
     *
     * Este endpoint es PÚBLICO.
     * Recibe dos parámetros por la URL (Query Params):
     * ?sucursal_id=1
     * ?fecha=2025-11-10 (Formato YYYY-MM-DD)
     */
    public function index(Request $request)
    {
        // 1. Validar la entrada
        $datosValidados = $request->validate([
            'sucursal_id' => 'required|integer|exists:sucursales,id',
            'fecha' => 'required|date_format:Y-m-d',
        ]);

        $sucursalId = $datosValidados['sucursal_id'];
        $fecha = Carbon::parse($datosValidados['fecha'])->startOfDay(); // Asegurarnos que es al inicio del día
        $hoy = Carbon::today();

        // 2. Validar que la fecha no sea en el pasado
        if ($fecha->isPast() && !$fecha->isSameDay($hoy)) {
            return response()->json([
                'message' => 'No puedes consultar fechas en el pasado.'
            ], 422); // 422 Unprocessable Entity
        }

        // 3. La consulta Mágica
        // Busca cupos en la sucursal correcta, para la fecha correcta,
        // que estén 'disponibles', y (MUY IMPORTANTE) que la hora de inicio
        // aún no haya pasado (si están consultando para hoy).
        $cupos = CupoHorario::where('sucursal_id', $sucursalId)
            ->where('estado', 'disponible')
            ->whereDate('hora_inicio', $fecha) // Compara solo la parte de la FECHA
            ->where('hora_inicio', '>=', Carbon::now()) // No mostrar cupos que ya pasaron (ej. 9:00 AM si son las 9:05 AM)
            ->orderBy('hora_inicio', 'asc')
            ->get();

        // 4. Devolver el JSON
        return response()->json($cupos);
    }
}
