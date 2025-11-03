import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonSpinner, IonChip, IonTextarea,
  IonDatetime, IonRadioGroup, IonRadio, IonButtons,
  IonItem, IonMenuButton
} from '@ionic/angular/standalone';
import { ServicioService } from '../services/servicio.service';
import { VehiculoService } from '../services/vehiculo.service';
import { ReservaService } from '../services/reserva.service';
import { Servicio, Vehiculo, Sucursal, CupoHorario } from '../models/interfaces';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonSpinner, IonChip, IonTextarea,
    IonDatetime, IonRadioGroup, IonRadio, IonButtons,
    IonItem, IonMenuButton
  ]
})
export class BookingPage implements OnInit {
  private router = inject(Router);
  private servicioService = inject(ServicioService);
  private vehiculoService = inject(VehiculoService);
  private reservaService = inject(ReservaService);

  // Signals
  currentStep = signal(1);
  isLoading = signal(false);
  
  // Data
  servicios = this.servicioService.servicios;
  vehiculos = this.vehiculoService.vehiculos;
  sucursales = this.reservaService.sucursales;
  cuposDisponibles = this.reservaService.cuposDisponibles;

  // Selections
  selectedServicioId = signal<number | null>(null);
  selectedVehiculoId = signal<number | null>(null);
  selectedSucursalId = signal<number | null>(null);
  selectedFecha = signal<string>('');
  selectedCupoId = signal<number | null>(null);
  observaciones = signal<string>('');

  // Date limits (cached to avoid ExpressionChangedAfterItHasBeenCheckedError)
  minDate: string = '';
  maxDate: string = '';

  // Computed
  selectedServicio = computed(() => {
    const id = this.selectedServicioId();
    return (this.servicios() || []).find(s => s.id === id) || null;
  });

  selectedVehiculo = computed(() => {
    const id = this.selectedVehiculoId();
    return (this.vehiculos() || []).find(v => v.id === id) || null;
  });

  precioCalculado = computed(() => {
    const servicioId = this.selectedServicioId();
    const vehiculo = this.selectedVehiculo();
    
    if (!servicioId || !vehiculo) return null;

    return this.servicioService.obtenerPrecioServicio(
      servicioId, 
      vehiculo.tipo_vehiculo_id
    );
  });

  canContinue = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return this.selectedServicioId() !== null && this.selectedVehiculoId() !== null;
      case 2:
        const sucursalOk = this.selectedSucursalId() !== null && this.selectedSucursalId() !== undefined;
        const fechaOk = this.selectedFecha() !== '' && this.selectedFecha() !== null && this.selectedFecha() !== undefined;
        return sucursalOk && fechaOk;
      case 3:
        return this.selectedCupoId() !== null;
      case 4:
        return true;
      default:
        return false;
    }
  });

  ngOnInit() {
    // Initialize date limits once to avoid ExpressionChangedAfterItHasBeenCheckedError
    const today = new Date();
    this.minDate = today.toISOString();
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    this.maxDate = maxDate.toISOString();

    this.cargarDatos();
    
    // Check if coming from services page with servicioId
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const servicioId = navigation.extras.state['servicioId'];
      if (servicioId) {
        this.selectedServicioId.set(servicioId);
      }
    }
  }

  cargarDatos() {
    this.isLoading.set(true);

    this.servicioService.obtenerServicios().subscribe();
    this.vehiculoService.obtenerMisVehiculos().subscribe();
    this.reservaService.obtenerSucursales().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  onSucursalChange(event: any) {
    this.selectedSucursalId.set(event.detail.value);
    
    // Si ya hay fecha seleccionada, cargar cupos
    if (this.selectedFecha() && this.selectedSucursalId()) {
      this.cargarCuposDisponibles();
    }
  }

  onFechaChange(event: any) {
    const fecha = event.detail.value?.split('T')[0];
    
    if (fecha) {
      this.selectedFecha.set(fecha);
      
      // Si ya hay sucursal seleccionada, cargar cupos
      if (this.selectedSucursalId()) {
        this.cargarCuposDisponibles();
      }
    }
  }

  cargarCuposDisponibles() {
    const sucursalId = this.selectedSucursalId();
    
    if (!sucursalId || !this.selectedFecha()) return;

    this.isLoading.set(true);
    this.reservaService.obtenerCuposDisponibles(sucursalId, this.selectedFecha()).subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  nextStep() {
    if (this.canContinue() && this.currentStep() < 4) {
      this.currentStep.set(this.currentStep() + 1);
      
      // Load cupos when moving to step 3
      if (this.currentStep() === 3) {
        this.cargarCuposDisponibles();
      }
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  confirmarReserva() {
    if (!this.canContinue()) return;

    this.isLoading.set(true);
    
    const reservaData = {
      vehiculo_id: this.selectedVehiculoId()!,
      precio_servicio_id: this.selectedServicioId()!,
      cupo_horario_id: this.selectedCupoId()!,
    };

    this.reservaService.crearReserva(reservaData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/reservations']); // ✅ Ahora la ruta existe
      },
      error: () => {
        this.isLoading.set(false);
        alert('Error al crear la reserva. Por favor intenta nuevamente.');
      }
    });
  }

  formatHora(fechaHora: string): string {
    const date = new Date(fechaHora);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  getTipoVehiculoNombre(tipoId: number): string {
    const vehiculo = (this.vehiculos() || []).find(v => v.id === this.selectedVehiculoId());
    return vehiculo?.tipo_vehiculo?.nombre || '';
  }

  getSelectedCupoFechaHora(): string {
    const cupo = (this.cuposDisponibles() || []).find(c => c.id === this.selectedCupoId());
    return cupo?.hora_inicio || '';
  }

  getSelectedSucursalNombre(): string {
    const sucursal = (this.sucursales() || []).find(s => s.id === this.selectedSucursalId());
    return sucursal?.nombre || '';
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToVehiculos() {
    this.router.navigate(['/vehiculos']);
  }
}
