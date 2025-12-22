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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToggle,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, refresh } from 'ionicons/icons';
import { ApiService } from 'src/app/services/api.service';
import {
  AdminHorarioTrabajoService,
  HorarioTrabajo,
  CrearHorarioTrabajoRequest,
  ActualizarHorarioTrabajoRequest,
} from 'src/app/services/admin-horario-trabajo.service';
import { forkJoin, Observable } from 'rxjs';

interface Sucursal {
  id: number;
  nombre: string;
}

interface DiaConfig {
  dia_semana: number;
  label: string;
  abierto: boolean;
  hora_inicio: string;
  hora_fin: string;
  id?: number;
}

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.page.html',
  styleUrls: ['./horarios.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonToggle,
  ],
})
export class HorariosPage implements OnInit {
  private api = inject(ApiService);
  private adminHorarioService = inject(AdminHorarioTrabajoService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  sucursales: Sucursal[] = [];
  sucursalId: number | null = null;

  dias: DiaConfig[] = [
    { dia_semana: 1, label: 'Lunes', abierto: false, hora_inicio: '08:00', hora_fin: '17:00' },
    { dia_semana: 2, label: 'Martes', abierto: false, hora_inicio: '08:00', hora_fin: '17:00' },
    { dia_semana: 3, label: 'Miércoles', abierto: false, hora_inicio: '08:00', hora_fin: '17:00' },
    { dia_semana: 4, label: 'Jueves', abierto: false, hora_inicio: '08:00', hora_fin: '17:00' },
    { dia_semana: 5, label: 'Viernes', abierto: false, hora_inicio: '08:00', hora_fin: '17:00' },
    { dia_semana: 6, label: 'Sábado', abierto: false, hora_inicio: '09:00', hora_fin: '13:00' },
    { dia_semana: 7, label: 'Domingo', abierto: false, hora_inicio: '09:00', hora_fin: '13:00' },
  ];

  constructor() {
    addIcons({ save, refresh });
  }

  ngOnInit(): void {
    this.cargarSucursales();
  }

  async cargarSucursales() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando sucursales...' });
    await loading.present();

    this.api.get<Sucursal[]>('/sucursales').subscribe({
      next: async (sucursales) => {
        this.sucursales = sucursales;
        if (this.sucursales.length > 0 && !this.sucursalId) {
          this.sucursalId = this.sucursales[0].id;
          this.cargarHorarios();
        }
        loading.dismiss();
      },
      error: async () => {
        loading.dismiss();
        await this.mostrarToast('No se pudieron cargar sucursales', 'danger');
      },
    });
  }

  onSucursalChange() {
    if (!this.sucursalId) return;
    this.cargarHorarios();
  }

  async cargarHorarios() {
    if (!this.sucursalId) return;

    const loading = await this.loadingCtrl.create({ message: 'Cargando horarios...' });
    await loading.present();

    this.adminHorarioService.listBySucursal(this.sucursalId).subscribe({
      next: (horarios) => {
        this.mapHorariosToDias(horarios);
        loading.dismiss();
      },
      error: async (err: any) => {
        loading.dismiss();
        const msg = err?.error?.message || 'No se pudieron cargar horarios';
        await this.mostrarToast(msg, 'danger');
      },
    });
  }

  private mapHorariosToDias(horarios: HorarioTrabajo[]) {
    const map = new Map<number, HorarioTrabajo>();
    for (const h of horarios) {
      map.set(h.dia_semana, h);
    }

    this.dias = this.dias.map((d) => {
      const h = map.get(d.dia_semana);
      if (!h) {
        return { ...d, abierto: false, id: undefined };
      }
      return {
        ...d,
        abierto: true,
        id: h.id,
        hora_inicio: (h.hora_inicio || '').slice(0, 5),
        hora_fin: (h.hora_fin || '').slice(0, 5),
      };
    });
  }

  async guardarCambios() {
    if (!this.sucursalId) {
      await this.mostrarToast('Selecciona una sucursal', 'warning');
      return;
    }

    const horariosActivos = this.dias
      .filter((d) => d.abierto)
      .map((d) => {
        if (!d.hora_inicio || !d.hora_fin) {
          throw new Error(`Completa horas para ${d.label}`);
        }
        return {
          dia_semana: d.dia_semana,
          hora_inicio: d.hora_inicio,
          hora_fin: d.hora_fin,
        };
      });

    const payload = {
      sucursal_id: this.sucursalId,
      horarios: horariosActivos,
    };

    console.log('Payload enviado:', payload);

    const loading = await this.loadingCtrl.create({ message: 'Guardando horarios...' });
    await loading.present();

    this.adminHorarioService.sync(payload).subscribe({
      next: async () => {
        loading.dismiss();
        await this.mostrarToast('Horarios guardados', 'success');
        await this.cargarHorarios();
      },
      error: async (err: any) => {
        loading.dismiss();
        const msg = err?.error?.message || 'No se pudieron guardar los horarios';
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
