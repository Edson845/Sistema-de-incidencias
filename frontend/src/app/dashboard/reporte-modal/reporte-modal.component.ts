import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService } from '../../services/tickets.service';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { EstadisticasService } from '../../services/estadisticas.service';

const pdfMakeX: any = pdfMake;
pdfMakeX.vfs = pdfFonts.vfs;

@Component({
  selector: 'app-reporte-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reporte-modal.component.html',
  styleUrls: ['./reporte-modal.component.css']
})

export class ReporteModalComponent {
  @Input() isOpen = false;
  @Input() oficinas: any[] = [];
  @Output() closeModal = new EventEmitter<void>();

  tabActivaIndex: number = 0;
  oficinaSeleccionada: string = '';
  filtros = {
    fechaInicio: '',
    fechaFin: '',
    area: ''
  };
  tickets: any[] = [];


  resumen = {
    total: 0,
    nuevos: 0,
    resueltosHoy: 0,
    promedioSolucion: "0 horas"
  };

  constructor(private EstadisticasService: EstadisticasService, private ticketsService: TicketsService) { }

  ngOnChanges() {
    if (this.isOpen) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    // 1. Cargar resumen del dashboard
    this.EstadisticasService.getEstadisticasGenerales().subscribe({
      next: (data) => {
        this.resumen = {
          total: data.total ?? 0,
          nuevos: data.nuevos ?? 0,
          resueltosHoy: data.resueltosHoy ?? 0,
          promedioSolucion: data.promedioSolucion ?? "Sin datos"
        };
      },
      error: (err) => console.error("❌ Error en resumen:", err)
    });

    // 2. Cargar tickets detallados
    this.ticketsService.obtenerTicketsDetallado().subscribe({
      next: (data) => {
        this.tickets = Array.isArray(data) ? data : [];
      },
      error: (err) => console.error("❌ Error en tickets:", err)
    });
  }


  cerrar() {
    this.closeModal.emit();
  }

  generarExcel() {
    this.ticketsService.obtenerTicketsDetallado().subscribe({
      next: async (tickets: any[]) => {

        if (!tickets || tickets.length === 0) {
          alert("No hay tickets cargados.");
          return;
        }

        const oficina = (this.oficinaSeleccionada || "").toLowerCase().trim();

        const datosFiltrados = oficina
          ? tickets.filter(t =>
            (t.nombreOficina || "").toLowerCase().trim() === oficina
          )
          : tickets;

        if (!datosFiltrados.length) {
          alert("No hay datos para exportar.");
          return;
        }

        // 🔹 Crear libro y hoja
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tickets');

        // 🔹 Encabezados con estilos
        const columnas = [
          { header: 'ID', key: 'idTicket', width: 10 },
          { header: 'Título', key: 'tituloTicket', width: 30 },
          { header: 'Descripción', key: 'descTicket', width: 40 },
          { header: 'Estado', key: 'nombreEstado', width: 15 },
          { header: 'Prioridad', key: 'nombrePrioridad', width: 15 },
          { header: 'Categoría', key: 'nombreCategoria', width: 20 },
          { header: 'Usuario', key: 'usuario', width: 25 },
          { header: 'Fecha Creación', key: 'fechaCreacion', width: 18 },
        ];

        worksheet.columns = columnas;

        // 🔹 Agregar estilo a encabezados
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF333333' }
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        // 🔹 Agregar filas
        datosFiltrados.forEach(ticket => {
          worksheet.addRow({
            idTicket: ticket.idTicket,
            tituloTicket: ticket.tituloTicket,
            descTicket: ticket.descTicket,
            nombreEstado: ticket.nombreEstado,
            nombrePrioridad: ticket.nombrePrioridad,
            nombreCategoria: ticket.nombreCategoria,
            usuario: `${ticket.nombreUsuario || ""} ${ticket.apellidoUsuario || ""}`.trim(),
            fechaCreacion: new Date(ticket.fechaCreacion).toLocaleDateString()
          });
        });

        // 🔹 Border para todas las celdas
        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        });

        // 🔹 Ajustar alto de filas
        worksheet.eachRow((row) => {
          row.height = 20;
        });

        // 🔹 Generar y descargar
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(blob, `Tickets_${new Date().toISOString().slice(0, 10)}.xlsx`);

      },
      error: (err) => {
        console.error("Error al obtener tickets:", err);
        alert("No se pudieron cargar los tickets.");
      }
    });
  }

  generarPdf(grafico1Base64?: string, grafico2Base64?: string) {

    const hoy = new Date().toLocaleDateString();
    const oficina = this.oficinaSeleccionada || "Todas las oficinas";

    const contentArray: any[] = [];

    // -------------------------------------------------------------------
    // 🟦 PORTADA
    // -------------------------------------------------------------------
    contentArray.push(
      {
        text: 'Municipalidad Provincial de San Román',
        style: 'tituloPortada'
      },
      {
        text: 'INFORME DE TICKETS DEL SISTEMA DE INCIDENCIAS',
        style: 'subtituloPortada'
      },
      {
        text: `Oficina seleccionada: ${oficina}`,
        alignment: 'center',
        margin: [0, 10, 0, 0],
        fontSize: 12
      },
      {
        text: `Fecha de generación: ${hoy}`,
        style: 'fechaPortada'
      },
      { text: '\n\n\n\n\n\n' },
      {
        text: 'Reporte generado automáticamente por el sistema.',
        alignment: 'center',
        italics: true
      },
      { text: '', pageBreak: 'after' }
    );

    // -------------------------------------------------------------------
    // 🟪 RESUMEN EJECUTIVO
    // -------------------------------------------------------------------
    contentArray.push(
      { text: '1. Resumen Ejecutivo', style: 'titulo1' },
      {
        text:
          `Este informe resume la actividad de tickets registrados en el Sistema de Incidencias.
La información corresponde a la oficina seleccionada: **${oficina}**.
El archivo Excel adjunto contiene el detalle completo de los tickets.`,
        style: 'texto'
      },
      { text: '\n' }
    );

    // -------------------------------------------------------------------
    // 🟩 ESTADÍSTICAS GENERALES
    // -------------------------------------------------------------------
    contentArray.push(
      { text: '2. Estadísticas Generales', style: 'titulo1' },

      {
        ul: [
          `Oficina analizada: ${oficina}`,
          `Total de tickets: ${this.resumen.total}`,
          `Tickets nuevos: ${this.resumen.nuevos}`,
          `Tickets resueltos hoy: ${this.resumen.resueltosHoy}`,
          `Tiempo promedio de resolución: ${this.resumen.promedioSolucion}`,
        ],
        style: 'texto'
      },

      { text: '\n' }
    );

    // -------------------------------------------------------------------
    // 🟧 GRÁFICOS
    // -------------------------------------------------------------------
    if (grafico1Base64) {
      contentArray.push(
        { text: 'Distribución de Tickets por Estado', style: 'titulo2' },
        {
          image: grafico1Base64,
          width: 400,
          alignment: 'center',
          margin: [0, 10, 0, 20]
        }
      );
    }

    if (grafico2Base64) {
      contentArray.push(
        { text: 'Tendencia de Tickets por Día', style: 'titulo2' },
        {
          image: grafico2Base64,
          width: 400,
          alignment: 'center',
          margin: [0, 10, 0, 20]
        }
      );
    }

    // -------------------------------------------------------------------
    // 🟥 TABLA RESUMIDA
    // -------------------------------------------------------------------
    contentArray.push(
      { text: '3. Resumen de Tickets', style: 'titulo1' },
      {
        text: `*Mostrando hasta 15 tickets de la oficina: ${oficina}*`,
        italics: true,
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: "ID", style: "tableHeader" },
              { text: "Título", style: "tableHeader" },
              { text: "Estado", style: "tableHeader" },
              { text: "Prioridad", style: "tableHeader" },
              { text: "Fecha", style: "tableHeader" },
            ],
            ...this.tickets.slice(0, 15).map(t => [
              t.idTicket,
              t.tituloTicket,
              t.nombreEstado,
              t.nombrePrioridad,
              new Date(t.fechaCreacion).toLocaleDateString(),
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\n' }
    );

    // -------------------------------------------------------------------
    // 🟫 CONCLUSIONES
    // -------------------------------------------------------------------
    contentArray.push(
      { text: '4. Conclusiones', style: 'titulo1' },
      {
        text:
          `El análisis realizado para la oficina "${oficina}" muestra un comportamiento estable.
Se recomienda monitorear los tiempos de resolución y reforzar la atención en las áreas con mayores incidencias.`,
        style: 'texto'
      },
      { text: '\n' }
    );

    // -------------------------------------------------------------------
    // 🟪 ANEXOS
    // -------------------------------------------------------------------
    contentArray.push(
      { text: '5. Anexos', style: 'titulo1' },
      {
        text: `Se adjunta un archivo Excel con el detalle completo de los tickets de la oficina "${oficina}".`,
        style: 'texto'
      }
    );

    // -------------------------------------------------------------------
    // GENERAR PDF
    // -------------------------------------------------------------------
    const docDefinition = {
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
      content: contentArray,
      styles: {
        tituloPortada: { fontSize: 24, bold: true, alignment: 'center', margin: [0, 80, 0, 10] },
        subtituloPortada: { fontSize: 16, alignment: 'center' },
        fechaPortada: { fontSize: 12, alignment: 'center', color: '#555' },
        titulo1: { fontSize: 16, bold: true },
        titulo2: { fontSize: 14, bold: true },
        texto: { fontSize: 11, lineHeight: 1.3 },
        tableHeader: { bold: true, fillColor: '#eeeeee' }
      }
    };

    pdfMake.createPdf(docDefinition).download("Informe_Tickets.pdf");
  }
}
