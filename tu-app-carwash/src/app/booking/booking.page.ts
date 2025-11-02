import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, 
  IonButton, IonSelect, IonSelectOption, IonItem, IonLabel, IonText,
  IonIcon, IonSpinner, IonChip, IonTextarea, IonDatetime, IonRadioGroup,
  IonRadio, IonButtons, IonBackButton
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
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent,
    IonButton, IonSelect, IonSelectOption, IonItem, IonLabel, IonText,
    IonIcon, IonSpinner, IonChip, IonTextarea, IonDatetime, IonRadioGroup,
    IonRadio, IonButtons, IonBackButton
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

  // Computed
  selectedServicio = computed(() => {
    const id = this.selectedServicioId();
    return this.servicios().find(s => s.id === id) || null;
  });

  selectedVehiculo = computed(() => {
    const id = this.selectedVehiculoId();
    return this.vehiculos().find(v => v.id === id) || null;
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
        return this.selectedSucursalId() !== null && this.selectedFecha() !== '';
      case 3:
        return this.selectedCupoId() !== null;
      case 4:
        return true;
      default:
        return false;
    }
  });

  ngOnInit() {
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

  onFechaChange(event: any) {
    const fecha = event.detail.value?.split('T')[0];
    if (fecha && this.selectedSucursalId()) {
      this.selectedFecha.set(fecha);
      this.cargarCuposDisponibles();
    }
  }

  cargarCuposDisponibles() {
    const sucursalId = this.selectedSucursalId();
    const fecha = this.selectedFecha();
    
    if (!sucursalId || !fecha) return;

    this.isLoading.set(true);
    this.reservaService.obtenerCuposDisponibles(sucursalId, fecha).subscribe({
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
      servicio_id: this.selectedServicioId()!,
      cupo_horario_id: this.selectedCupoId()!,
      observaciones: this.observaciones() || undefined
    };

    this.reservaService.crearReserva(reservaData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/reservations']);
      },
      error: () => {
        this.isLoading.set(false);
        alert('Error al crear la reserva. Por favor intenta nuevamente.');
      }
    });
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString();
  }

  getMaxDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString();
  }

  formatHora(fechaHora: string): string {
    const date = new Date(fechaHora);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  getTipoVehiculoNombre(tipoId: number): string {
    const vehiculo = this.vehiculos().find(v => v.id === this.selectedVehiculoId());
    return vehiculo?.tipo_vehiculo?.nombre || '';
  }

  getSelectedCupoFechaHora(): string {
    const cupo = this.cuposDisponibles().find(c => c.id === this.selectedCupoId());
    return cupo?.fecha_hora || '';
  }

  getSelectedSucursalNombre(): string {
    const sucursal = this.sucursales().find(s => s.id === this.selectedSucursalId());
    return sucursal?.nombre || '';
  }
}
