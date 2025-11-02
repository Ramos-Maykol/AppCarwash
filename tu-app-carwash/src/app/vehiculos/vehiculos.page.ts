import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonModal, IonFab, IonFabButton, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonText, IonSpinner
} from '@ionic/angular/standalone';
import { VehiculoService } from '../services/vehiculo.service';
import { Vehiculo, TipoVehiculo } from '../models/interfaces';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonModal, IonFab, IonFabButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonText, IonSpinner
  ]
})
export class VehiculosPage implements OnInit {
  private fb = inject(FormBuilder);
  private vehiculoService = inject(VehiculoService);

  vehiculos = this.vehiculoService.vehiculos;
  tiposVehiculo = this.vehiculoService.tiposVehiculo;
  isModalOpen = signal(false);
  isLoading = signal(false);
  isEditing = signal(false);
  editingId = signal<number | null>(null);

  vehiculoForm: FormGroup = this.fb.group({
    tipo_vehiculo_id: ['', Validators.required],
    placa: ['', [Validators.required, Validators.minLength(6)]],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    color: ['', Validators.required]
  });

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading.set(true);
    this.vehiculoService.obtenerTiposVehiculo().subscribe({
      next: () => {
        this.vehiculoService.obtenerMisVehiculos().subscribe({
          next: () => this.isLoading.set(false),
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  abrirModal(vehiculo?: Vehiculo) {
    if (vehiculo) {
      this.isEditing.set(true);
      this.editingId.set(vehiculo.id);
      this.vehiculoForm.patchValue(vehiculo);
    } else {
      this.isEditing.set(false);
      this.editingId.set(null);
      this.vehiculoForm.reset();
    }
    this.isModalOpen.set(true);
  }

  cerrarModal() {
    this.isModalOpen.set(false);
    this.vehiculoForm.reset();
  }

  guardarVehiculo() {
    if (this.vehiculoForm.valid) {
      this.isLoading.set(true);
      const data = this.vehiculoForm.value;

      const operation = this.isEditing()
        ? this.vehiculoService.actualizarVehiculo(this.editingId()!, data)
        : this.vehiculoService.crearVehiculo(data);

      operation.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.cerrarModal();
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  eliminarVehiculo(id: number) {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.isLoading.set(true);
      this.vehiculoService.eliminarVehiculo(id).subscribe({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false)
      });
    }
  }

  getTipoVehiculoNombre(tipoId: number): string {
    const tipo = this.tiposVehiculo().find(t => t.id === tipoId);
    return tipo ? tipo.nombre : '';
  }
}
