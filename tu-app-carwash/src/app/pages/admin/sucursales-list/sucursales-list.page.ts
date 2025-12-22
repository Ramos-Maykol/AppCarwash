import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, chevronForward, refresh } from 'ionicons/icons';
import { AdminSucursalService, Sucursal } from 'src/app/services/admin-sucursal.service';

@Component({
  selector: 'app-sucursales-list',
  templateUrl: './sucursales-list.page.html',
  styleUrls: ['./sucursales-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class SucursalesListPage implements OnInit {
  private router = inject(Router);
  private sucursalService = inject(AdminSucursalService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  sucursales: Sucursal[] = [];

  constructor() {
    addIcons({ add, chevronForward, refresh });
  }

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(event?: any) {
    const loading = !event ? await this.loadingCtrl.create({ message: 'Cargando...' }) : null;
    if (loading) await loading.present();

    this.sucursalService.listPublic().subscribe({
      next: (sucursales) => {
        this.sucursales = sucursales;
        if (loading) loading.dismiss();
        if (event) event.target.complete();
      },
      error: async () => {
        if (loading) loading.dismiss();
        if (event) event.target.complete();
        await this.mostrarToast('No se pudieron cargar sucursales', 'danger');
      },
    });
  }

  irCrear() {
    this.router.navigate(['/admin/sucursales/crear']);
  }

  irEditar(sucursal: Sucursal) {
    this.router.navigate(['/admin/sucursales/editar', sucursal.id]);
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await toast.present();
  }
}
