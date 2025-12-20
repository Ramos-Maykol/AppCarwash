import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonCard, IonCardContent, IonBadge, IonSpinner, IonSegment, IonSegmentButton, IonLabel, IonRefresher, IonRefresherContent, IonMenuButton } from '@ionic/angular/standalone';
import { ReservaService } from '../services/reserva.service';
import { Reserva } from '../models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonCard, IonCardContent, IonBadge, IonSpinner, IonSegment, IonSegmentButton, IonLabel, IonRefresher, IonRefresherContent, IonMenuButton],
})
export class ReservationsPage implements OnInit {
  private reservaService = inject(ReservaService);
  private router = inject(Router);

  get reservas() {
    return this.reservaService.reservas;
  }
  isLoading = signal(false);
  selectedFilter = signal<string>('todas');

  reservasFiltradas = signal<Reserva[]>([]);

  ngOnInit() {
    this.filtrarReservas(); // Inicializar el filtro con array vacío
    this.cargarReservas();
  }

  cargarReservas(event?: any) {
    this.isLoading.set(true);
    this.reservaService.obtenerMisReservas().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.filtrarReservas();
        if (event) {
          event.target.complete();
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 401) {
          // Usuario no autenticado, redirigir al login
          this.router.navigate(['/auth/login']);
        } else {
          console.error('Error al cargar reservas:', error);
        }
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  onFilterChange(event: any) {
    this.selectedFilter.set(event.detail.value);
    this.filtrarReservas();
  }

  filtrarReservas() {
    const filter = this.selectedFilter();
    const todas = this.reservas() || [];

    if (filter === 'todas') {
      this.reservasFiltradas.set(todas);
    } else if (filter === 'activas') {
      this.reservasFiltradas.set(
        todas.filter(r => ['pendiente', 'confirmada', 'en_proceso'].includes(r.estado))
      );
    } else if (filter === 'completadas') {
      this.reservasFiltradas.set(
        todas.filter(r => r.estado === 'completada')
      );
    } else if (filter === 'canceladas') {
      this.reservasFiltradas.set(
        todas.filter(r => r.estado === 'cancelada')
      );
    }
  }

  cancelarReserva(id: number) {
    if (confirm('¿Estás seguro de cancelar esta reserva?')) {
      this.isLoading.set(true);
      this.reservaService.cancelarReserva(id).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.filtrarReservas();
        },
        error: (err: any) => {
          this.isLoading.set(false);
          const backendMessage = err?.error?.message;
          if (err?.status === 422 && backendMessage) {
            alert(backendMessage);
            return;
          }
          alert('No se pudo cancelar la reserva');
        }
      });
    }
  }

  nuevaReserva() {
    this.router.navigate(['/booking']);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'estado-pendiente';
      case 'confirmada': return 'estado-confirmada';
      case 'en_proceso': return 'estado-proceso';
      case 'completada': return 'estado-completada';
      case 'cancelada': return 'estado-cancelada';
      default: return '';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'en_proceso': return 'En Proceso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatearHora(fechaHora: string): string {
    const date = new Date(fechaHora);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  puedeSerCancelada(reserva: Reserva): boolean {
    if (reserva.estado !== 'pendiente') return false;
    const inicio = reserva.cupo_horario?.hora_inicio;
    if (!inicio) return false;
    const inicioDate = new Date(inicio);
    return inicioDate.getTime() > Date.now();
  }
}
