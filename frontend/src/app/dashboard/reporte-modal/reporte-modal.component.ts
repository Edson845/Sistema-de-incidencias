import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TicketsService } from '../../services/tickets.service';
import * as XLSX from 'xlsx';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

const pdfMakeX: any = pdfMake;
pdfMakeX.vfs = pdfFonts.vfs;

@Component({
    selector: 'app-reporte-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule
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

    constructor(private ticketsService: TicketsService) { }

    cerrar() {
        this.closeModal.emit();
    }

    generarPdf() {
        this.ticketsService.obtenerTicketsDetallado().subscribe({
            next: (tickets: any[]) => {
                if (!tickets || tickets.length === 0) {
                    alert("No hay tickets cargados.");
                    return;
                }

                // Filtrar por oficina
                const datosFiltrados = this.oficinaSeleccionada
                    ? tickets.filter(t => t.nombreOficina === this.oficinaSeleccionada)
                    : tickets;

                if (!datosFiltrados.length) {
                    alert("No hay datos para exportar.");
                    return;
                }

                // Preparar filas de la tabla
                const filasTabla = datosFiltrados.map(t => ([
                    t.idTicket,
                    t.tituloTicket,
                    t.descTicket,
                    t.nombreEstado,
                    t.nombrePrioridad,
                    t.nombreCategoria,
                    `${t.nombreUsuario || ""} ${t.apellidoUsuario || ""}`.trim(),
                    new Date(t.fechaCreacion).toLocaleDateString()
                ]));

                // Estructura del PDF
                const docDefinition: any = {
                    content: [
                        { text: "Reporte de Tickets", style: "header" },
                        { text: `Oficina: ${this.oficinaSeleccionada || "Todas"}`, margin: [0, 0, 0, 10] },

                        {
                            table: {
                                headerRows: 1,
                                widths: ["auto", "auto", "*", "auto", "auto", "auto", "*", "auto"],
                                body: [
                                    [
                                        { text: "ID", style: "tableHeader" },
                                        { text: "Título", style: "tableHeader" },
                                        { text: "Descripción", style: "tableHeader" },
                                        { text: "Estado", style: "tableHeader" },
                                        { text: "Prioridad", style: "tableHeader" },
                                        { text: "Categoría", style: "tableHeader" },
                                        { text: "Usuario", style: "tableHeader" },
                                        { text: "Fecha", style: "tableHeader" }
                                    ],
                                    ...filasTabla
                                ]
                            }
                        }
                    ],

                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true,
                            alignment: "center",
                            margin: [0, 0, 0, 10]
                        },
                        tableHeader: {
                            bold: true,
                            fillColor: "#eeeeee"
                        }
                    }
                };

                // Descargar PDF
                pdfMake.createPdf(docDefinition)
                    .download(`Tickets_${new Date().toISOString().slice(0, 10)}.pdf`);
            },

            error: (err) => {
                console.error("Error al obtener tickets:", err);
                alert("No se pudieron cargar los datos.");
            }
        });
    }

    generarExcel() {
        this.ticketsService.obtenerTicketsDetallado().subscribe({
            next: (tickets: any[]) => {
                if (!tickets || tickets.length === 0) {
                    alert("No hay tickets cargados.");
                    return;
                }

                // Filtrar por oficina si se selecciona
                const datosFiltrados = this.oficinaSeleccionada
                    ? tickets.filter(ticket => ticket.nombreOficina === this.oficinaSeleccionada)
                    : tickets;

                if (!datosFiltrados.length) {
                    alert("No hay datos para exportar.");
                    return;
                }

                // Preparar datos para Excel
                const datosExcel = datosFiltrados.map(ticket => ({
                    ID: ticket.idTicket,
                    Título: ticket.tituloTicket,
                    Descripción: ticket.descTicket,
                    Estado: ticket.nombreEstado,
                    Prioridad: ticket.nombrePrioridad,
                    Categoría: ticket.nombreCategoria,
                    Usuario: `${ticket.nombreUsuario || ""} ${ticket.apellidoUsuario || ""}`.trim(),
                    FechaCreación: new Date(ticket.fechaCreacion).toLocaleDateString()
                }));

                // Generar Excel
                const worksheet = XLSX.utils.json_to_sheet(datosExcel);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
                XLSX.writeFile(workbook, `Tickets_${new Date().toISOString().slice(0, 10)}.xlsx`);
            },
            error: (err) => {
                console.error("Error al obtener tickets:", err);
                alert("No se pudieron cargar los tickets.");
            }
        });
    }
}
