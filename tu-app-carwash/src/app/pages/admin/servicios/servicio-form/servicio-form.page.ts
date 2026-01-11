import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';
import {
  AdminServicio,
  AdminServicioService,
  AdminTipoVehiculo,
  GuardarServicioRequest,
} from 'src/app/services/admin-servicio.service';

@Component({
  selector: 'app-servicio-form',
  templateUrl: './servicio-form.page.html',
  styleUrls: ['./servicio-form.page.scss'],
  standalone: true,
  host: {
    class: 'ion-page',
  },
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonFooter,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class ServicioFormPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminServicioService = inject(AdminServicioService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  modo = signal<'crear' | 'editar'>('crear');
  servicioId = signal<number | null>(null);

  tiposVehiculo = signal<AdminTipoVehiculo[]>([]);

  form = signal<{ nombre: string; descripcion: string; duracion_estimada_minutos: number }>({
    nombre: '',
    descripcion: '',
    duracion_estimada_minutos: 30,
  });

  preciosPorTipo = signal<Record<number, string>>({});

  constructor() {
    addIcons({ save });
  }

  get id(): number | null {
    return this.servicioId();
  }

  get titulo(): string {
    return this.modo() === 'crear' ? 'Nuevo Servicio' : 'Editar Servicio';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.modo.set('editar');
      this.servicioId.set(Number(idParam));
    }

    this.cargarInicial();
  }

  async cargarInicial() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...' });
    await loading.present();

    this.adminServicioService.listTiposVehiculo().subscribe({
      next: (tipos) => {
        this.tiposVehiculo.set(tipos);

        const preciosIniciales: Record<number, string> = {};
        for (const tv of tipos) {
          preciosIniciales[tv.id] = '';
        }
        this.preciosPorTipo.set(preciosIniciales);

        if (this.modo() === 'editar' && this.servicioId()) {
          this.cargarServicioEditar(this.servicioId()!, loading);
          return;
        }

        loading.dismiss();
      },
      error: async () => {
        loading.dismiss();
        await this.mostrarToast('No se pudieron cargar los tipos de vehículo', 'danger');
      },
    });
  }

  private cargarServicioEditar(id: number, loading: HTMLIonLoadingElement) {
    this.adminServicioService.get(id).subscribe({
      next: (servicio) => {
        loading.dismiss();
        this.mapToEditar(servicio);
      },
      error: async () => {
        loading.dismiss();
        await this.mostrarToast('No se pudo cargar el servicio', 'danger');
        this.router.navigate(['/admin/servicios']);
      },
    });
  }

  private mapToEditar(servicio: AdminServicio) {
    this.form.set({
      nombre: servicio.nombre ?? '',
      descripcion: servicio.descripcion ?? '',
      duracion_estimada_minutos: servicio.duracion_estimada_minutos ?? 30,
    });

    const precios = servicio.preciosServicio ?? servicio.precios_servicio ?? [];
    const map: Record<number, string> = { ...this.preciosPorTipo() };

    for (const tv of this.tiposVehiculo()) {
      const ps = precios.find((p) => p.tipo_vehiculo_id === tv.id);
      map[tv.id] = ps?.precio ?? '';
    }

    this.preciosPorTipo.set(map);
  }

  updateNombre(event: any) {
    const value = this.getIonInputValue(event);
    this.form.update((curr) => ({ ...curr, nombre: value }));
  }

  updateDescripcion(event: any) {
    const value = this.getIonInputValue(event);
    this.form.update((curr) => ({ ...curr, descripcion: value }));
  }

  updateDuracion(event: any) {
    const value = this.getIonInputValue(event);
    const num = Number(value);
    this.form.update((curr) => ({ ...curr, duracion_estimada_minutos: Number.isNaN(num) ? 0 : num }));
  }

  updatePrecio(tipoVehiculoId: number, event: any) {
    const value = this.getIonInputValue(event);
    this.preciosPorTipo.update((curr) => ({ ...curr, [tipoVehiculoId]: value }));
  }

  private getIonInputValue(event: any): string {
    const detailValue = event?.detail?.value;
    if (detailValue !== undefined && detailValue !== null) {
      return String(detailValue);
    }
    const targetValue = event?.target?.value;
    if (targetValue !== undefined && targetValue !== null) {
      return String(targetValue);
    }
    return '';
  }

  async guardar() {
    const f = this.form();
    if (!f.nombre?.trim()) {
      await this.mostrarToast('El nombre es obligatorio', 'warning');
      return;
    }

    const tipos = this.tiposVehiculo();
    if (!tipos.length) {
      await this.mostrarToast('No hay tipos de vehículo configurados', 'warning');
      return;
    }

    const preciosMap = this.preciosPorTipo();
    const preciosPayload: GuardarServicioRequest['precios'] = [];

    for (const tv of tipos) {
      const raw = (preciosMap[tv.id] ?? '').toString().trim();
      const precioNum = Number(raw);

      if (raw === '' || Number.isNaN(precioNum)) {
        await this.mostrarToast(`Define un precio válido para ${tv.nombre}`, 'warning');
        return;
      }
      if (precioNum < 0) {
        await this.mostrarToast(`El precio para ${tv.nombre} no puede ser negativo`, 'warning');
        return;
      }

      preciosPayload.push({ tipo_vehiculo_id: tv.id, precio: precioNum });
    }

    const payload: GuardarServicioRequest = {
      nombre: f.nombre.trim(),
      descripcion: f.descripcion ?? null,
      duracion_estimada_minutos: Number(f.duracion_estimada_minutos ?? 0),
      precios: preciosPayload,
    };

    if (!payload.duracion_estimada_minutos || payload.duracion_estimada_minutos < 5) {
      await this.mostrarToast('La duración mínima es 5 minutos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    if (this.modo() === 'crear') {
      this.adminServicioService.create(payload).subscribe({
        next: async () => {
          loading.dismiss();
          await this.mostrarToast('Servicio creado', 'success');
          this.router.navigate(['/admin/servicios']);
        },
        error: async (err: any) => {
          loading.dismiss();
          await this.mostrarToast(err?.error?.message || 'No se pudo crear el servicio', 'danger');
        },
      });
      return;
    }

    const id = this.servicioId();
    if (!id) {
      loading.dismiss();
      await this.mostrarToast('No se pudo determinar el servicio a editar', 'danger');
      return;
    }

    this.adminServicioService.update(id, payload).subscribe({
      next: async () => {
        loading.dismiss();
        await this.mostrarToast('Servicio actualizado', 'success');
        this.router.navigate(['/admin/servicios']);
      },
      error: async (err: any) => {
        loading.dismiss();
        await this.mostrarToast(err?.error?.message || 'No se pudo actualizar el servicio', 'danger');
      },
    });
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2200, color, position: 'bottom' });
    await toast.present();
  }
}
