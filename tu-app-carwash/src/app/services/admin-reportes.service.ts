import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { saveAs } from 'file-saver';

// Librerías de Exportación
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, HeadingLevel, TextRun } from 'docx';

// --- IMPORTACIONES PDFMAKE CORREGIDAS ---
import * as pdfMakePkg from "pdfmake/build/pdfmake";
import * as pdfFontsPkg from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// CORRECCIÓN PARA "IMMUTABLE IMPORT":
// 1. Obtenemos el objeto mutable accediendo a .default (si existe) o al paquete mismo.
//    Esto evita intentar escribir sobre el "Namespace" congelado.
const pdfMake = (pdfMakePkg as any).default || pdfMakePkg;
const pdfFonts = (pdfFontsPkg as any).default || pdfFontsPkg;

// 2. Asignamos las fuentes al objeto mutable
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;
// ---------------------------------------

export interface ReportData {
  meta: any;
  kpis: {
    total_ingresos: number;
    total_lavados: number;
    distribucion_estado: { [key: string]: number };
    tendencia_ingresos: { dia: string; total: number }[];
  };
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminReportesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/admin/reportes';

  // 1. OBTENER DATOS
  getReportData(filtros: any = {}): Observable<ReportData> {
    let params = new HttpParams();
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.estado) params = params.set('estado', filtros.estado);

    return this.http.get<ReportData>(`${this.apiUrl}/data`, { params });
  }

  // 2. GENERAR WORD (DOCX)
  async generarWord(datos: any[]) {
    // Crear filas de la tabla
    const tableRows = datos.map(item => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(item.fecha || '')] }),
        new TableCell({ children: [new Paragraph(item.cliente || '')] }),
        new TableCell({ children: [new Paragraph(item.servicio || '')] }),
        new TableCell({ children: [new Paragraph(String(item.monto || 0))] }),
        new TableCell({ children: [new Paragraph(item.estado || '')] }),
      ],
    }));

    // Encabezado con Negrita
    tableRows.unshift(new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Fecha", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Cliente", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Servicio", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Monto", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Estado", bold: true })] })] }),
      ],
    }));

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ 
            text: "Reporte de Ventas Carwash", 
            heading: HeadingLevel.HEADING_1 
          }),
          new Paragraph({ 
            text: `Generado: ${new Date().toLocaleDateString()}` 
          }),
          new Paragraph({ text: "" }), // Espacio vacío
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Reporte_Carwash_${Date.now()}.docx`);
  }

  // 3. GENERAR EXCEL (XLSX)
  generarExcel(datos: any[]) {
    const dataFormatted = datos.map(d => ({
      Fecha: d.fecha,
      Cliente: d.cliente,
      Servicio: d.servicio,
      Monto: d.monto,
      Estado: d.estado
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataFormatted);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    
    XLSX.writeFile(wb, `Reporte_Carwash_${Date.now()}.xlsx`);
  }

  // 4. GENERAR PDF (PDFMake)
  generarPDF(datos: any[]) {
    // Definir cuerpo de la tabla
    const bodyData = [
      // Encabezados
      [
        { text: 'Fecha', bold: true },
        { text: 'Cliente', bold: true },
        { text: 'Servicio', bold: true },
        { text: 'Monto', bold: true },
        { text: 'Estado', bold: true }
      ],
      // Datos
      ...datos.map(p => [
        p.fecha || '',
        p.cliente || '',
        p.servicio || '',
        `$${p.monto || 0}`,
        p.estado || ''
      ])
    ];

    // Definición del documento
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Reporte Oficial Carwash', style: 'header' },
        { text: `Fecha: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: bodyData
          }
        }
      ],
      styles: {
        header: { 
          fontSize: 18, 
          bold: true, 
          alignment: 'center', 
          margin: [0, 0, 0, 10] 
        }
      }
    };

    // Usamos la variable local 'pdfMake' que ya tiene las fuentes asignadas
    pdfMake.createPdf(docDefinition).download(`Reporte_Carwash_${Date.now()}.pdf`);
  }
}