<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CupoHorario extends Model
{
    use HasFactory;

    protected $table = 'cupo_horarios';

    protected $fillable = [
        'sucursal_id',
        'hora_inicio', // ¡Este es un DateTime completo! ej. "2025-11-04 09:00:00"
        'hora_fin',    // ¡Este es un DateTime completo! ej. "2025-11-04 09:30:00"
        'estado',      // 'disponible', 'reservado', 'bloqueado'
    ];

    /**
     * Casts para manejar tipos de datos automáticamente.
     * ¡Muy importante para las fechas!
     */
    protected $casts = [
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime',
    ];

    // --- RELACIONES ---

    /**
     * Un Cupo Horario PERTENECE A UNA Sucursal.
     * (Relación Inversa de hasMany)
     */
    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class, 'sucursal_id');
    }

    /**
     * Un Cupo Horario tiene UNA Reserva.
     * (Si su estado es 'reservado')
     * (Relación Uno a Uno)
     */
    public function reserva()
    {
        return $this->hasOne(Reserva::class, 'cupo_horario_id');
    }
}
