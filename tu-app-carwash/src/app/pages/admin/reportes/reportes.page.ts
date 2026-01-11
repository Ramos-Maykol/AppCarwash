import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonMenuButton, IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  ToastController, LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { download, refresh } from 'ionicons/icons';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AdminReportesService, ReportData } from 'src/app/services/admin-reportes.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, BaseChartDirective, IonContent, IonHeader, IonTitle,
    IonToolbar, IonButtons, IonBackButton, IonMenuButton, IonButton,
    IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent,
  ],
})
export class ReportesPage implements OnInit {
  private reportesService = inject(AdminReportesService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  fullData = signal<ReportData | null>(null);

  kpiTotalIngresos = computed(() => this.fullData()?.kpis?.total_ingresos ?? 0);
  kpiTotalLavados = computed(() => this.fullData()?.kpis?.total_lavados ?? 0);
  
  kpiPendientes = computed(() => {
    const dist = this.fullData()?.kpis?.distribucion_estado;
    return dist ? (dist['pendiente'] || dist['Pendiente'] || 0) : 0;
  });

  ingresosBarData = signal<ChartConfiguration<'bar'>['data']>({ 
    labels: [], 
    datasets: [] 
  });
  
  ingresosBarOptions: ChartOptions<'bar'> = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'S/ ' + value;
          }
        }
      }
    }
  };

  estadosPieData = signal<ChartConfiguration<'pie'>['data']>({ 
    labels: [], 
    datasets: [] 
  });
  
  estadosPieOptions: ChartOptions<'pie'> = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      }
    }
  };

  constructor() {
    addIcons({ download, refresh });
  }

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Obteniendo datos...' });
    await loading.present();

    this.reportesService.getReportData().subscribe({
      next: (resp) => {
        this.fullData.set(resp);
        this.buildCharts(resp);
        loading.dismiss();
      },
      error: async (err: any) => {
        loading.dismiss();
        console.error(err);
        await this.mostrarToast('Error al cargar datos', 'danger');
      },
    });
  }

  private buildCharts(data: ReportData) {
    // Gráfico de Barras (Tendencia de Ingresos)
    const labelsDia = (data.kpis.tendencia_ingresos || []).map((x) => x.dia);
    const valoresDia = (data.kpis.tendencia_ingresos || []).map((x) => Number(x.total));

    this.ingresosBarData.set({
      labels: labelsDia,
      datasets: [{ 
        data: valoresDia, 
        label: 'Ingresos por Día',
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 6,
      }],
    });

    // Gráfico de Pie (Distribución Estados)
    const estadosObj = data.kpis.distribucion_estado || {};
    const labelsEstado = Object.keys(estadosObj);
    const valoresEstado = Object.values(estadosObj);

    this.estadosPieData.set({
      labels: labelsEstado,
      datasets: [{ 
        data: valoresEstado, 
        backgroundColor: [
          '#10b981', // Verde - Completado
          '#f59e0b', // Amarillo - Pendiente
          '#ef4444', // Rojo - Cancelado
          '#6366f1', // Morado - Otros
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    });
  }

  async descargar(type: 'pdf' | 'excel' | 'word') {
    const dataActual = this.fullData()?.data;
    
    if (!dataActual || dataActual.length === 0) {
      await this.mostrarToast('No hay datos para exportar', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Generando archivo...' });
    await loading.present();

    try {
      if (type === 'word') {
        await this.reportesService.generarWord(dataActual);
      } else if (type === 'excel') {
        this.reportesService.generarExcel(dataActual);
      } else if (type === 'pdf') {
        this.reportesService.generarPDF(dataActual);
      }
      
      await this.mostrarToast('Descarga iniciada exitosamente', 'success');
    } catch (error) {
      console.error(error);
      await this.mostrarToast('Error generando el archivo', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message, 
      duration: 2500, 
      color, 
      position: 'bottom' 
    });
    await toast.present();
  }
}