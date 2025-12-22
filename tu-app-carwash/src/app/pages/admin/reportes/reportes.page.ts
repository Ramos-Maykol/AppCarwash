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
// Importamos el servicio actualizado y la interfaz
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

  // Signal para guardar TODA la respuesta del servidor
  fullData = signal<ReportData | null>(null);

  // Computeds para los KPIs (conectados al nuevo JSON del Backend)
  kpiTotalIngresos = computed(() => this.fullData()?.kpis?.total_ingresos ?? 0);
  kpiTotalLavados = computed(() => this.fullData()?.kpis?.total_lavados ?? 0);
  
  // Usamos un pequeño truco para contar pendientes si el backend devuelve un objeto
  kpiPendientes = computed(() => {
    const dist = this.fullData()?.kpis?.distribucion_estado;
    return dist ? (dist['pendiente'] || 0) : 0; 
    // Ajusta 'pendiente' según cómo guardes el estado en BD (mayus/minus)
  });

  // Configuración de Gráficos
  ingresosBarData = signal<ChartConfiguration<'bar'>['data']>({ labels: [], datasets: [] });
  ingresosBarOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false };

  estadosPieData = signal<ChartConfiguration<'pie'>['data']>({ labels: [], datasets: [] });
  estadosPieOptions: ChartOptions<'pie'> = { responsive: true, maintainAspectRatio: false };

  constructor() {
    addIcons({ download, refresh });
  }

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Obteniendo datos...' });
    await loading.present();

    // Llamamos al nuevo método unificado
    this.reportesService.getReportData().subscribe({
      next: (resp) => {
        this.fullData.set(resp); // Guardamos todo el JSON
        this.buildCharts(resp);  // Construimos gráficas
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
    // 1. Gráfico de Barras (Tendencia de Ingresos)
    // El backend ahora envía 'tendencia_ingresos' con {dia, total}
    const labelsDia = (data.kpis.tendencia_ingresos || []).map((x) => x.dia);
    const valoresDia = (data.kpis.tendencia_ingresos || []).map((x) => Number(x.total));

    this.ingresosBarData.set({
      labels: labelsDia,
      datasets: [{ data: valoresDia, label: 'Ingresos por Día', backgroundColor: '#3880ff' }],
    });

    // 2. Gráfico de Pie (Distribución Estados)
    // El backend envía un objeto: {'completado': 10, 'pendiente': 5}
    const estadosObj = data.kpis.distribucion_estado || {};
    const labelsEstado = Object.keys(estadosObj); // ['completado', 'pendiente']
    const valoresEstado = Object.values(estadosObj); // [10, 5]

    this.estadosPieData.set({
      labels: labelsEstado,
      datasets: [{ data: valoresEstado, backgroundColor: ['#2dd36f', '#ffc409', '#eb445a'] }],
    });
  }

  async descargar(type: 'pdf' | 'excel' | 'word') {
    // Validamos que tengamos datos cargados antes de intentar descargar
    const dataActual = this.fullData()?.data;
    
    if (!dataActual || dataActual.length === 0) {
      await this.mostrarToast('No hay datos para exportar', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Generando archivo...' });
    await loading.present();

    try {
      // AQUÍ OCURRE LA MAGIA DEL CLIENT-SIDE
      // Ya no pedimos nada al servidor, usamos los datos que ya tenemos en memoria
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
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'bottom' });
    await toast.present();
  }
}