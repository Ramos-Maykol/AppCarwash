import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonSearchbar, IonIcon, IonRefresher, IonRefresherContent, 
  ToastController, LoadingController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { time, car, checkmarkCircle, closeCircle, call, calendar, refresh } from 'ionicons/icons';

// Importamos el servicio y la interfaz
import { AdminReservaService, Reserva } from 'src/app/services/admin-reserva';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonSearchbar, IonIcon, IonRefresher, IonRefresherContent
  ]
})
export class ReservasPage implements OnInit {
  
  // Inyecciones
  private reservaService = inject(AdminReservaService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  // Variables de Estado
  reservas: Reserva[] = [];
  isLoading = true;
  filtroFecha: string = ''; // Formato YYYY-MM-DD
  
  constructor() {
    addIcons({ time, car, checkmarkCircle, closeCircle, call, calendar, refresh });
  }

  ngOnInit() {
    this.cargarReservas();
  }

  async cargarReservas(event?: any) {
    this.isLoading = true;
    
    // Si quieres filtrar por fecha de hoy por defecto:
    // const hoy = new Date().toISOString().split('T')[0];

    this.reservaService.getReservas().subscribe({
      next: (response) => {
        console.log('Reservas recibidas:', response);
        this.reservas = response.data; // Laravel paginado devuelve 'data'
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
        this.mostrarToast('Error al conectar con el servidor', 'danger');
        this.isLoading = false;
        if (event) event.target.complete();
      }
    });
  }

  async cambiarEstado(reserva: Reserva, nuevoEstado: string) {
    const loading = await this.loadingCtrl.create({ message: 'Actualizando...' });
    await loading.present();

    this.reservaService.updateEstado(reserva.id, nuevoEstado).subscribe({
      next: (resp) => {
        loading.dismiss();
        this.mostrarToast(`Reserva ${nuevoEstado} correctamente`, 'success');
        // Actualizamos la lista localmente para reflejar el cambio rápido
        reserva.estado = nuevoEstado as any; 
      },
      error: (err) => {
        loading.dismiss();
        console.error(err);
        this.mostrarToast('Error al actualizar estado', 'danger');
      }
    });
  }

  // Helper para clases CSS (Igual que antes)
  getStatusClass(estado: string) {
    switch (estado) {
      case 'confirmada': return 'badge-warning'; // Laravel usa 'confirmada' en vez de 'pendiente'
      case 'en_proceso': return 'badge-process';
      case 'completada': return 'badge-success';
      case 'cancelada': return 'badge-error';
      default: return 'badge-default';
    }
  }

  private async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}