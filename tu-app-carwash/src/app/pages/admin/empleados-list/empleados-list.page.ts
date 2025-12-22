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
import { AdminEmpleadoService, Empleado } from 'src/app/services/admin-empleado.service';

@Component({
  selector: 'app-empleados-list',
  templateUrl: './empleados-list.page.html',
  styleUrls: ['./empleados-list.page.scss'],
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
export class EmpleadosListPage implements OnInit {
  private router = inject(Router);
  private empleadoService = inject(AdminEmpleadoService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  empleados: Empleado[] = [];

  constructor() {
    addIcons({ add, chevronForward, refresh });
  }

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(event?: any) {
    const loading = !event ? await this.loadingCtrl.create({ message: 'Cargando...' }) : null;
    if (loading) await loading.present();

    this.empleadoService.list().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        if (loading) loading.dismiss();
        if (event) event.target.complete();
      },
      error: async () => {
        if (loading) loading.dismiss();
        if (event) event.target.complete();
        await this.mostrarToast('No se pudieron cargar empleados', 'danger');
      },
    });
  }

  irCrear() {
    this.router.navigate(['/admin/empleados/crear']);
  }

  irEditar(empleado: Empleado) {
    this.router.navigate(['/admin/empleados/editar', empleado.id]);
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await toast.present();
  }
}
