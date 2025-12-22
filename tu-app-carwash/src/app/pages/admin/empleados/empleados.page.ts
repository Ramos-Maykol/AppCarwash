import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonIcon,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, refresh, addCircle } from 'ionicons/icons';
import {
  AdminEmpleadoService,
  Empleado,
  Cargo,
  Sucursal,
  CrearEmpleadoRequest,
} from 'src/app/services/admin-empleado.service';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.page.html',
  styleUrls: ['./empleados.page.scss'],
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
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
    IonIcon,
  ],
})
export class EmpleadosPage implements OnInit {
  private adminEmpleadoService = inject(AdminEmpleadoService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  empleados: Empleado[] = [];
  cargos: Cargo[] = [];
  sucursales: Sucursal[] = [];

  form: CrearEmpleadoRequest = {
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

  constructor() {
    addIcons({ trash, refresh, addCircle });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...' });
    await loading.present();

    this.adminEmpleadoService.listCargos().subscribe({
      next: (cargos) => {
        this.cargos = cargos;
      },
      error: async () => {
        await this.mostrarToast('No se pudieron cargar cargos', 'danger');
      },
    });

    this.adminEmpleadoService.listSucursales().subscribe({
      next: (sucursales) => {
        this.sucursales = sucursales;
      },
      error: async () => {
        await this.mostrarToast('No se pudieron cargar sucursales', 'danger');
      },
    });

    this.adminEmpleadoService.list().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        loading.dismiss();
      },
      error: async () => {
        loading.dismiss();
        await this.mostrarToast('No se pudieron cargar empleados', 'danger');
      },
    });
  }

  async crearEmpleado() {
    if (!this.form.nombre || !this.form.apellido || !this.form.email || !this.form.password || !this.form.password_confirmation || !this.form.cargo_id) {
      await this.mostrarToast('Completa los campos obligatorios', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    this.adminEmpleadoService.create(this.form).subscribe({
      next: async (empleado) => {
        loading.dismiss();
        this.empleados = [empleado, ...this.empleados];
        this.form = {
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
        await this.mostrarToast('Empleado creado', 'success');
      },
      error: async (err: any) => {
        loading.dismiss();
        const msg = err?.error?.message || 'No se pudo crear el empleado';
        await this.mostrarToast(msg, 'danger');
      },
    });
  }

  async eliminarEmpleado(empleado: Empleado) {
    const loading = await this.loadingCtrl.create({ message: 'Eliminando...' });
    await loading.present();

    this.adminEmpleadoService.delete(empleado.id).subscribe({
      next: async () => {
        loading.dismiss();
        this.empleados = this.empleados.filter((e) => e.id !== empleado.id);
        await this.mostrarToast('Empleado eliminado', 'success');
      },
      error: async (err: any) => {
        loading.dismiss();
        const msg = err?.error?.message || 'No se pudo eliminar el empleado';
        await this.mostrarToast(msg, 'danger');
      },
    });
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
