<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\CupoHorario;
use App\Models\PrecioServicio;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ReservaController extends Controller
{
    /**
     * Muestra una lista de las reservas del cliente autenticado.
     * Este endpoint es PROTEGIDO (requiere autenticación).
     */
    public function index(Request $request)
    {
        // 1. Obtener el usuario autenticado y su perfil de cliente
        $usuario = $request->user();
        $cliente = $usuario->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'El perfil de cliente no fue encontrado para este usuario.'], 404);
        }

        // 2. Obtener las reservas del cliente
        // Usamos 'with' (Eager Loading) para traer toda la información relacionada
        // en una sola consulta eficiente.
        $reservas = $cliente->reservas()
            ->with([
                'cupoHorario',                   // Carga los datos del cupo (fecha, hora)
                'vehiculo.tipoVehiculo',         // Carga el vehículo y su tipo (ej. "SUV")
                'precioServicio.servicio'        // Carga el servicio (ej. "Lavado Básico")
            ])
            ->orderBy('id', 'desc') // Mostrar las más recientes primero
            ->get();

        // 3. Devolver las reservas como JSON
        return response()->json($reservas);
    }

    /**
     * Almacena una nueva reserva en la base de datos.
     * Este endpoint es PROTEGIDO (requiere autenticación).
     */
    public function store(Request $request)
    {
        // 1. Obtener el usuario autenticado y su perfil de cliente
        $usuario = $request->user();
        $cliente = $usuario->cliente; // Usamos la relación que definimos

        if (!$cliente) {
            return response()->json(['message' => 'El perfil de cliente no fue encontrado para este usuario.'], 404);
        }

        // 2. Validar los datos de entrada
        $datosValidados = $request->validate([
            'cupo_horario_id' => [
                'required',
                'integer',
                // Validar que el cupo exista Y que esté 'disponible'
                Rule::exists('cupos_horarios', 'id')->where('estado', 'disponible')
            ],
            'vehiculo_id' => [
                'required',
                'integer',
                // Validar que el vehículo exista Y que pertenezca al cliente autenticado
                Rule::exists('vehiculos', 'id')->where('cliente_id', $cliente->id)
            ],
            'precio_servicio_id' => 'required|integer|exists:precios_servicios,id',
        ]);

        // 3. Obtener los modelos que necesitamos
        $cupo = CupoHorario::findOrFail($datosValidados['cupo_horario_id']);
        $precioServicio = PrecioServicio::findOrFail($datosValidados['precio_servicio_id']);

        // 4. Doble chequeo de seguridad (opcional pero recomendado)
        // Asegurarse de que el cupo no sea en el pasado
        if (Carbon::parse($cupo->hora_inicio)->isPast()) {
            return response()->json(['message' => 'No puedes reservar un cupo que ya ha pasado.'], 422);
        }

        // 5. La Transacción de Base de Datos (¡La parte más importante!)
        try {
            DB::beginTransaction(); // <-- Iniciar transacción

            // Paso A: Actualizar el cupo
            $cupo->estado = 'reservado';
            $cupo->save();

            // Paso B: Crear la reserva
            $reserva = Reserva::create([
                'cliente_id' => $cliente->id,
                'cupo_horario_id' => $cupo->id,
                'vehiculo_id' => $datosValidados['vehiculo_id'],
                'precio_servicio_id' => $precioServicio->id,
                'precio_final' => $precioServicio->precio, // Guardamos el precio en el momento
                'estado' => 'confirmada', // O 'pendiente' si requiere aprobación
            ]);
            
            // (Opcional: Crear un registro de pago 'pendiente')
            // $reserva->pagos()->create([
            //     'monto' => $precioServicio->precio,
            //     'estado' => 'pendiente',
            //     'metodo_pago' => 'por_definir'
            // ]);

            DB::commit(); // <-- Confirmar transacción si todo salió bien

            // 6. Devolver la reserva creada
            // Usamos 'load' para incluir la información del cupo y vehículo en la respuesta
            $reserva->load('cupoHorario', 'vehiculo');

            return response()->json([
                'message' => '¡Reserva creada exitosamente!',
                'reserva' => $reserva
            ], 201); // 201 Creado

        } catch (\Exception $e) {
            DB::rollBack(); // <-- Revertir todo si algo falló
            
            // \Illuminate\Support\Facades\Log::error('Error al crear reserva: ' . $e->getMessage()); // Para depuración
            
            return response()->json([
                'message' => 'Error al procesar la reserva. Por favor, inténtelo de nuevo.',
                'error' => $e->getMessage() // Ocultar en producción
            ], 500); // 500 Error de Servidor
        }
    }
}

