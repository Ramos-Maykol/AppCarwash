import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonSpinner, IonText, IonMenuButton
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiculoService } from '../services/vehiculo.service';
import { Vehiculo, TipoVehiculo } from '../models/interfaces';

@Component({
  selector: 'app-vehiculo-form',
  templateUrl: './vehiculo-form.page.html',
  styleUrls: ['./vehiculo-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonSpinner, IonText, IonMenuButton
  ]
})
export class VehiculoFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private vehiculoService = inject(VehiculoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tiposVehiculo = this.vehiculoService.tiposVehiculo;
  isLoading = signal(false);
  isSaving = signal(false);
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

    // Verificar si estamos editando desde state o parámetros de ruta
    const vehiculoId = this.route.snapshot.paramMap.get('id');

    if (vehiculoId) {
      // Edición desde parámetros de ruta (por compatibilidad futura)
      console.warn('La edición desde parámetros de ruta no está implementada aún');
    } else {
      // Verificar si hay datos en el state de navegación (desde lista de vehículos)
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras?.state) {
        const vehiculo = navigation.extras.state['vehiculo'] as Vehiculo;
        if (vehiculo) {
          this.isEditing.set(true);
          this.editingId.set(vehiculo.id);
          this.vehiculoForm.patchValue(vehiculo);
        }
      }
    }
  }

  cargarDatos() {
    // Si los tipos no están cargados, cargarlos
    if (this.tiposVehiculo().length === 0) {
      this.isLoading.set(true);
      this.vehiculoService.obtenerTiposVehiculo().subscribe({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false)
      });
    }
  }

  guardarVehiculo() {
    if (this.vehiculoForm.valid) {
      this.isSaving.set(true);
      const data = this.vehiculoForm.value;

      console.log('📤 Enviando datos al servidor:', data);
      console.log('📤 Formulario completo:', this.vehiculoForm.value);
      console.log('📤 Modo edición:', this.isEditing());
      console.log('📤 ID del vehículo:', this.editingId());

      const request = this.isEditing()
        ? this.vehiculoService.actualizarVehiculo(this.editingId()!, data)
        : this.vehiculoService.crearVehiculo(data);

      console.log('📤 URL de la petición:', this.isEditing() ? `/vehiculos/${this.editingId()}` : '/vehiculos');

      request.subscribe({
        next: (response) => {
          console.log('✅ Vehículo guardado exitosamente:', response);
          this.isSaving.set(false);
          this.router.navigate(['/vehiculos']);
        },
        error: (error) => {
          console.error('❌ Error completo:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error response:', error.error);

          this.isSaving.set(false);

          if (error.status === 422) {
            // Error de validación
            alert('Datos inválidos. Revisa el formulario.');
          } else if (error.status === 404) {
            alert('Perfil de cliente no encontrado. Contacta al administrador.');
          } else if (error.status === 500) {
            alert('Error interno del servidor. Revisa la consola para más detalles.');
          } else {
            alert('Error desconocido: ' + (error.error?.message || error.message));
          }
        }
      });
    } else {
      console.log('❌ Formulario inválido:', this.vehiculoForm.errors);
      console.log('❌ Estado del formulario:', this.vehiculoForm.value);
    }
  }

  cancelar() {
    this.router.navigate(['/vehiculos']);
  }

  getTipoVehiculoNombre(tipoId: number): string {
    const tipo = (this.tiposVehiculo() || []).find(t => t.id === tipoId);
    return tipo ? tipo.nombre : '';
  }
}
