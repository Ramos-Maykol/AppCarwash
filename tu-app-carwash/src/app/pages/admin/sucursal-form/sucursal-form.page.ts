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
  AdminSucursalService,
  CrearSucursalRequest,
  ActualizarSucursalRequest,
  Sucursal,
} from 'src/app/services/admin-sucursal.service';

@Component({
  selector: 'app-sucursal-form',
  templateUrl: './sucursal-form.page.html',
  styleUrls: ['./sucursal-form.page.scss'],
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
export class SucursalFormPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sucursalService = inject(AdminSucursalService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  modo: 'crear' | 'editar' = 'crear';
  sucursalId: number | null = null;

  formData: CrearSucursalRequest = {
    nombre: '',
    direccion: '',
    telefono: null,
    esta_activa: true,
  };

  constructor() {
    addIcons({ save, trash });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.modo = 'editar';
      this.sucursalId = Number(idParam);
      this.cargarSucursal(this.sucursalId);
    }
  }

  async cargarSucursal(id: number) {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...' });
    await loading.present();

    this.sucursalService.get(id).subscribe({
      next: (response: any) => {
        loading.dismiss();
        const data = response?.data ?? response;
        console.log('Sucursal data recibida:', data);
        if (!data) {
          this.mostrarToast('No se recibió información de la sucursal', 'warning');
          this.router.navigate(['/admin/sucursales']);
          return;
        }

        const activa = data.esta_activa == 1 || data.esta_activa === true || data.esta_activa === '1';

        // Asignación explícita para que el template mantenga referencia y se actualice
        this.formData.nombre = data.nombre ?? '';
        this.formData.direccion = data.direccion ?? '';
        this.formData.telefono = data.telefono ?? null;
        this.formData.esta_activa = activa;
      },
      error: async (err: any) => {
        loading.dismiss();
        console.error('Error cargando sucursal', err);
        await this.mostrarToast('No se pudo cargar la sucursal', 'danger');
        this.router.navigate(['/admin/sucursales']);
      },
    });
  }

  async guardar() {
    if (this.modo === 'crear') {
      if (!this.formData.nombre || !this.formData.direccion) {
        await this.mostrarToast('Nombre y dirección son obligatorios', 'warning');
        return;
      }

      const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
      await loading.present();

      const payload: CrearSucursalRequest = {
        nombre: this.formData.nombre,
        direccion: this.formData.direccion,
        telefono: this.formData.telefono ?? null,
        esta_activa: this.formData.esta_activa ?? true,
      };

      this.sucursalService.create(payload).subscribe({
        next: async () => {
          loading.dismiss();
          await this.mostrarToast('Sucursal creada', 'success');
          this.router.navigate(['/admin/sucursales']);
        },
        error: async (err: any) => {
          loading.dismiss();
          await this.mostrarToast(err?.error?.message || 'No se pudo crear', 'danger');
        },
      });
      return;
    }

    if (!this.sucursalId) return;

    if (!this.formData.nombre || !this.formData.direccion) {
      await this.mostrarToast('Nombre y dirección son obligatorios', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Actualizando...' });
    await loading.present();

    const payload: ActualizarSucursalRequest = {
      nombre: this.formData.nombre,
      direccion: this.formData.direccion,
      telefono: this.formData.telefono ?? null,
      esta_activa: this.formData.esta_activa ?? true,
    };

    this.sucursalService.update(this.sucursalId, payload).subscribe({
      next: async () => {
        loading.dismiss();
        await this.mostrarToast('Sucursal actualizada', 'success');
        this.router.navigate(['/admin/sucursales']);
      },
      error: async (err: any) => {
        loading.dismiss();
        await this.mostrarToast(err?.error?.message || 'No se pudo actualizar', 'danger');
      },
    });
  }

  async eliminar() {
    if (!this.sucursalId) return;

    const loading = await this.loadingCtrl.create({ message: 'Eliminando...' });
    await loading.present();

    this.sucursalService.delete(this.sucursalId).subscribe({
      next: async () => {
        loading.dismiss();
        await this.mostrarToast('Sucursal eliminada', 'success');
        this.router.navigate(['/admin/sucursales']);
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
