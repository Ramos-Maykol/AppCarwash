import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonIcon,
  IonList,
  ToastController,
  LoadingController,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, trash } from 'ionicons/icons';
import {
  AdminEmpleadoService,
  Cargo,
  Sucursal,
  CrearEmpleadoRequest,
  ActualizarEmpleadoRequest,
  Empleado,
} from 'src/app/services/admin-empleado.service';

@Component({
  selector: 'app-empleado-form',
  templateUrl: './empleado-form.page.html',
  styleUrls: ['./empleado-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
    IonIcon,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class EmpleadoFormPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private empleadoService = inject(AdminEmpleadoService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  modo: 'crear' | 'editar' = 'crear';
  empleadoId: number | null = null;

  cargos: Cargo[] = [];
  sucursales: Sucursal[] = [];

  formData: (CrearEmpleadoRequest & { password?: string; password_confirmation?: string }) = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    password_confirmation: '',
    cargo_id: 0,
    sucursal_id: null,
    codigo_empleado: null,
    activo: true,
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.modo = 'editar';
      this.empleadoId = Number(idParam);
    }

    if (this.modo === 'editar') {
      this.formData.password = '';
      this.formData.password_confirmation = '';
    }

    this.cargarCatalogos();
    if (this.modo === 'editar' && this.empleadoId) {
      this.cargarEmpleado(this.empleadoId);
    }
  }

  constructor() {
    addIcons({ save, trash });
  }

  async cargarCatalogos() {
    this.empleadoService.listCargos().subscribe({
      next: (cargos) => (this.cargos = cargos),
    });
    this.empleadoService.listSucursales().subscribe({
      next: (s) => (this.sucursales = s),
    });
  }

  async cargarEmpleado(id: number) {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...' });
    await loading.present();

    this.empleadoService.list().subscribe({
      next: (empleados) => {
        const empleado = empleados.find((e) => e.id === id);
        loading.dismiss();
        if (!empleado) {
          this.mostrarToast('Empleado no encontrado', 'warning');
          this.router.navigate(['/admin/empleados']);
          return;
        }
        this.mapToEditar(empleado);
      },
      error: async () => {
        loading.dismiss();
        await this.mostrarToast('No se pudo cargar el empleado', 'danger');
      },
    });
  }

  private mapToEditar(e: Empleado) {
    this.formData = {
      nombre: e.nombre,
      apellido: e.apellido,
      email: e.usuario?.email || '',
      cargo_id: e.cargo_id,
      sucursal_id: e.sucursal_id ?? null,
      codigo_empleado: e.codigo_empleado ?? null,
      activo: e.activo ?? true,
      password: '',
      password_confirmation: '',
    };
  }

  async guardar() {
    if (this.modo === 'crear') {
      if (!this.formData.nombre || !this.formData.apellido || !this.formData.email || !this.formData.password || !this.formData.password_confirmation || !this.formData.cargo_id) {
        await this.mostrarToast('Completa los campos obligatorios', 'warning');
        return;
      }

      const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
      await loading.present();

      const payload: CrearEmpleadoRequest = {
        nombre: this.formData.nombre,
        apellido: this.formData.apellido,
        email: this.formData.email,
        password: this.formData.password,
        password_confirmation: this.formData.password_confirmation,
        cargo_id: this.formData.cargo_id,
        sucursal_id: this.formData.sucursal_id ?? null,
        codigo_empleado: this.formData.codigo_empleado ?? null,
        activo: this.formData.activo ?? true,
      };

      this.empleadoService.create(payload).subscribe({
        next: async () => {
          loading.dismiss();
          await this.mostrarToast('Empleado creado', 'success');
          this.router.navigate(['/admin/empleados']);
        },
        error: async (err: any) => {
          loading.dismiss();
          await this.mostrarToast(err?.error?.message || 'No se pudo crear', 'danger');
        },
      });
      return;
    }

    if (!this.empleadoId) return;

    if (!this.formData.nombre || !this.formData.apellido || !this.formData.email || !this.formData.cargo_id) {
      await this.mostrarToast('Completa los campos obligatorios', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Actualizando...' });
    await loading.present();

    const payload: ActualizarEmpleadoRequest = {
      nombre: this.formData.nombre,
      apellido: this.formData.apellido,
      email: this.formData.email,
      cargo_id: this.formData.cargo_id,
      sucursal_id: this.formData.sucursal_id ?? null,
      codigo_empleado: this.formData.codigo_empleado ?? null,
      activo: this.formData.activo ?? true,
    };

    if (this.formData.password && this.formData.password_confirmation) {
      payload.password = this.formData.password;
      payload.password_confirmation = this.formData.password_confirmation;
    }

    this.empleadoService.update(this.empleadoId, payload).subscribe({
      next: async () => {
        loading.dismiss();
        await this.mostrarToast('Empleado actualizado', 'success');
        this.router.navigate(['/admin/empleados']);
      },
      error: async (err: any) => {
        loading.dismiss();
        await this.mostrarToast(err?.error?.message || 'No se pudo actualizar', 'danger');
      },
    });
  }

  async eliminar() {
    if (!this.empleadoId) return;

    const loading = await this.loadingCtrl.create({ message: 'Eliminando...' });
    await loading.present();

    this.empleadoService.delete(this.empleadoId).subscribe({
      next: async () => {
        loading.dismiss();
        await this.mostrarToast('Empleado eliminado', 'success');
        this.router.navigate(['/admin/empleados']);
      },
      error: async (err: any) => {
        loading.dismiss();
        await this.mostrarToast(err?.error?.message || 'No se pudo eliminar', 'danger');
      },
    });
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2200, color, position: 'bottom' });
    await toast.present();
  }
}
