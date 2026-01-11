import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  ToastController,
  LoadingController,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, pricetags, refresh, trash } from 'ionicons/icons';
import {
  AdminPrecioServicio,
  AdminServicio,
  AdminServicioService,
} from 'src/app/services/admin-servicio.service';

@Component({
  selector: 'app-servicios-admin',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class ServiciosPage implements OnInit {
  private router = inject(Router);
  private adminServicioService = inject(AdminServicioService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  currencyCode = 'USD';

  servicios = signal<AdminServicio[]>([]);
  cargando = signal(false);

  constructor() {
    addIcons({ add, create, pricetags, refresh, trash });
  }

  ngOnInit(): void {
    this.cargarTodo();
  }

  async cargarTodo(event?: any) {
    const loading = !event ? await this.loadingCtrl.create({ message: 'Cargando...' }) : null;
    if (loading) await loading.present();
    this.cargando.set(true);

    this.adminServicioService.list().subscribe({
      next: (servicios) => {
        this.servicios.set(servicios);
        this.cargando.set(false);
        if (loading) loading.dismiss();
        if (event) event.target.complete();
      },
      error: async () => {
        this.cargando.set(false);
        if (loading) loading.dismiss();
        if (event) event.target.complete();
        await this.mostrarToast('No se pudieron cargar los servicios', 'danger');
      },
    });
  }

  irNuevo() {
    this.router.navigate(['/admin/servicios/nuevo']);
  }

  irEditar(servicio: AdminServicio) {
    this.router.navigate(['/admin/servicios/editar', servicio.id]);
  }

  private getPrecios(servicio: AdminServicio): AdminPrecioServicio[] {
    return (servicio.preciosServicio ?? servicio.precios_servicio ?? []) as AdminPrecioServicio[];
  }

  obtenerPrecioBase(servicio: AdminServicio): string {
    const precios = this.getPrecios(servicio);
    if (!precios.length) return '-';
    const valores = precios
      .map((p: AdminPrecioServicio) => Number(p.precio))
      .filter((v: number) => !Number.isNaN(v));

    if (!valores.length) return '-';
    const min = Math.min(...valores);
    return min.toFixed(2);
  }

  obtenerPrecioBaseNumero(servicio: AdminServicio): number | null {
    const precios = this.getPrecios(servicio);
    if (!precios.length) return null;
    const valores = precios
      .map((p: AdminPrecioServicio) => Number(p.precio))
      .filter((v: number) => !Number.isNaN(v));

    if (!valores.length) return null;
    return Math.min(...valores);
  }


  async eliminar(servicio: AdminServicio) {
    const loading = await this.loadingCtrl.create({ message: 'Eliminando...' });
    await loading.present();

    this.adminServicioService.delete(servicio.id).subscribe({
      next: async () => {
        loading.dismiss();
        this.servicios.set(this.servicios().filter((s) => s.id !== servicio.id));
        await this.mostrarToast('Servicio eliminado', 'success');
      },
      error: async (err: any) => {
        loading.dismiss();
        await this.mostrarToast(err?.error?.message || 'No se pudo eliminar el servicio', 'danger');
      },
    });
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2200, color, position: 'bottom' });
    await toast.present();
  }
}
