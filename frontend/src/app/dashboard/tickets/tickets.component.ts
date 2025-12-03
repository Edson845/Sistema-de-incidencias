import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { AuthService } from '../../services/auth.service';
import { EstadisticasService } from '../../services/estadisticas.service';
import { CatalogoService } from '../../services/catalogos.service';
import { io, Socket } from "socket.io-client";
import { UsuariosService } from '../../services/usuarios.service';
import { TicketsService } from '../../services/tickets.service';
import * as XLSX from 'xlsx';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

//materials
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { ReporteModalComponent } from '../reporte-modal/reporte-modal.component';

const pdfMakeX: any = pdfMake;
pdfMakeX.vfs = pdfFonts.vfs;

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule, MatButtonModule, MatIconModule, MatToolbarModule, MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, ReporteModalComponent],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit, OnDestroy {
  private socket!: Socket;
  oficinaSeleccionada: any;
  tabActivaIndex: number = 0; // Empieza en la primera pestaña (índice 0)
  tabActiva: 'pdf' | 'excel' = 'pdf';
  modalAbierto = false;
  filtros = {
    fechaInicio: '',
    fechaFin: '',
    area: ''
  };

  usuario = {
    idOficina: ''
  };
  oficinas: any[] = [];
  tickets: any[] = [];
  ticketsFiltrados: any[] = [];
  ticketsDetallado: any[] = [];
  loading = true;
  error = '';



  resumen = {
    nuevos: 0,
    promedioSolucion: '0h',
    respuestasUsuarios: 0,
    resueltosHoy: 0,
    total: 0
  };

  // 🔹 Gráficos
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Nueva', 'Abierta', 'Proceso', 'Resuelto', 'Cerrada', 'No Procede'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#f59e0b', '#2563eb', '#22c55e', '#6b7280', '#9ca3af']
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    aspectRatio: 1,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: 'Distribución de Tickets por Estado'
      }
    }
  };

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Cantidad de Tickets',
      data: [],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Tendencia Mensual de Tickets'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }

  };

  // 🔹 Gráfico de Barras - Eficiencia de Técnicos
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Tickets Resueltos (Semana Actual)',
      data: [],
      backgroundColor: 'rgba(34, 197, 94, 0.7)',
      borderColor: '#22c55e',
      borderWidth: 2
    }]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Eficiencia de Técnicos'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        }
      }
    }
  };

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private estadisticasService: EstadisticasService,
    private CatalogoService: CatalogoService,
    private ticketsService: TicketsService
  ) { }

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.iniciarSockets();
    this.cargarOficinas();
    this.cargarTicketsDetallado();
    this.cargarEficienciaTecnicos();
  }
  ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
  }
  cargarTicketsDetallado() {
    this.ticketsService.obtenerTicketsDetallado().subscribe({
      next: (data) => {
        this.ticketsDetallado = data;
        console.log("Tickets detallado:", this.ticketsDetallado);
      },
      error: (err) => {
        console.error("Error cargando tickets detallado:", err);
      }
    });
  }
  cargarOficinas() {
    this.CatalogoService.obtenerOficinas().subscribe({
      next: (data) => {
        this.oficinas = data;
      },
      error: (err) => {
        console.error('Error al cargar Oficinas:', err);
      }
    });
  }
  cargarTickets() {
    this.loading = true;

    this.ticketsService.obtenerMisTickets().subscribe({
      next: (data: any[]) => {
        console.log("📥 Datos recibidos del backend:", data);

        if (!data || data.length === 0) {
          console.warn("⚠ No llegaron tickets desde el backend.");
        }

        this.tickets = data || [];
        this.ticketsFiltrados = [...this.tickets];
        this.loading = false;

        console.log("📌 Tickets cargados en el componente:", this.tickets);
      },
      error: (err) => {
        console.error("❌ Error al cargar los tickets:", err);
        this.error = "Error al cargar los tickets.";
        this.loading = false;
      }
    });
  }

 cargarEstadisticas(): void {
  this.estadisticasService.getEstadisticasGenerales().subscribe({
    next: (data: any) => {

      console.log("📊 Datos recibidos:", data);

      // 🔹 Resumen basado en el NUEVO endpoint
      this.resumen = {
        nuevos: Number(data.nuevos ?? 0),
        promedioSolucion: this.formatearTiempo(data.promedioSolucion),
        respuestasUsuarios: 0, // ya no existe este dato
        resueltosHoy: Number(data.resueltosHoy ?? 0),
        total: Number(data.total ?? 0)
      };
const porEstado = Array.isArray(data.porEstado) ? data.porEstado : [];

      const get = (id: number) =>
        porEstado.find((e: any) => Number(e.estado) === id)?.cantidad ?? 0;

      this.pieChartData = {
        labels: ['Nueva', 'Abierta', 'Proceso', 'Resuelto', 'Cerrada', 'No Procede'],
        datasets: [{
          data: [
            get(1), // Nueva
            get(2), // Abierta
            get(3), // Proceso
            get(4), // Resuelto
            get(5), // Cerrada
            get(6)  // No procede
          ],
          backgroundColor: [
            '#f59e0b', // nueva
            '#2563eb', // abierta
            '#22c55e', // proceso
            '#6b7280', // resuelto
            '#9ca3af', // cerrada
            '#a855f7'  // no procede
          ]
        }]
      };

      // ============================================================
      // 🟦 GRÁFICO DE LÍNEA — Tickets por día (data.ticketsPorDia)
      // ============================================================
      if (data.ticketsPorDia) {
        const dias = Object.keys(data.ticketsPorDia)
          .sort((a, b) => {
            const [da, ma, ya] = a.split('/');
            const [db, mb, yb] = b.split('/');
            return new Date(`${ya}-${ma}-${da}`).getTime() -
                   new Date(`${yb}-${mb}-${db}`).getTime();
          });

        const cantidades = dias.map(d => data.ticketsPorDia[d] ?? 0);

        this.lineChartData = {
          labels: dias,
          datasets: [{
            label: 'Tickets creados',
            data: cantidades,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            fill: true,
            tension: 0.4
          }]
        };
      }

    },

    error: (err) => {
      console.error("❌ Error al obtener estadísticas:", err);
      this.generarResumen(); // Fallback si falla la API
    }
  });
}

formatearTiempo(valor: any): string {
  if (!valor) return '—';

  // ⏱ Si MySQL devuelve "HH:MM:SS"
  if (typeof valor === 'string' && valor.includes(':')) {
    const [h, m, s] = valor.split(':').map(Number);

    if (h === 0 && m === 0) return `${s} seg`;
    if (h === 0) return `${m} min`;
    return `${h}h ${m}min`;
  }

  // Si viene en minutos o milisegundos, lo convertimos igual
  const horas = Number(valor);

  if (isNaN(horas)) return '—';

  if (horas < 1) return `${Math.round(horas * 60)} min`;

  return `${horas.toFixed(1)} h`;
}

  generarResumen(): void {
    const total = this.tickets.length;

    // Contar 'nuevos' como tickets con estado == 1
    const nuevos = this.tickets.filter(t => t.estado === 1).length;

    // Contar resueltos (estado == 0)
    const resueltos = this.tickets.filter(t => t.estado === 0).length;

    // Contar resueltos hoy
    const hoy = new Date().toISOString().split('T')[0];
    const resueltosHoy = this.tickets.filter(t =>
      t.fecha?.split('T')[0] === hoy && t.estado === 0
    ).length;

    this.resumen = {
      nuevos,
      promedioSolucion: '40 min',
      respuestasUsuarios: resueltos,
      resueltosHoy,
      total
    };
  }

  actualizarEstadisticas(data: any): void {
    // Actualizar gráfico de pastel con datos por estado
    if (data.porEstado) {
      const estadoData = data.porEstado.reduce((acc: any, item: any) => {

        const estado = (item.estado || '').toString().toLowerCase();

        // --- NUEVOS ---
        if (estado === 'nueva' || estado === 'nuevo' || estado === '1') {
          acc.nuevos = (acc.nuevos || 0) + item.cantidad;
        }

        // --- ABIERTOS ---
        else if (estado === 'abierta' || estado === '2') {
          acc.abiertos = (acc.abiertos || 0) + item.cantidad;
        }

        // --- EN PROCESO ---
        else if (estado === 'proceso' || estado === 'en proceso' || estado === '3') {
          acc.enProceso = (acc.enProceso || 0) + item.cantidad;
        }

        // --- CERRADOS (Resuelto + Cerrada) ---
        else if (estado === 'resuelto' || estado === 'cerrada' || estado === '4' || estado === '5') {
          acc.cerrados = (acc.cerrados || 0) + item.cantidad;
        }

        // --- NO PROCEDE ---
        else if (estado === 'no procede' || estado === '6') {
          acc.noProcede = (acc.noProcede || 0) + item.cantidad;
        }

        return acc;

      }, {});

      this.pieChartData.datasets[0].data = [
        estadoData.nuevos || 0,
        estadoData.abiertos || 0,
        estadoData.enProceso || 0,
        estadoData.cerrados || 0,
        estadoData.noProcede || 0
      ];

    }

    // Actualizar gráfico de línea con datos mensuales
    if (data.generales?.ticketsPorMes) {
      const meses = Object.keys(data.generales.ticketsPorMes);
      const cantidades = Object.values(data.generales.ticketsPorMes);

      // Ordenar meses cronológicamente
      const mesesOrdenados = meses.sort((a, b) => {
        const fechaA = new Date(a + ' 1, 2025');
        const fechaB = new Date(b + ' 1, 2025');
        return fechaA.getTime() - fechaB.getTime();
      });

      this.lineChartData.labels = mesesOrdenados;
      this.lineChartData.datasets[0].data = mesesOrdenados.map(mes =>
        data.generales.ticketsPorMes[mes] || 0
      );
    } else {
      // Fallback: Calcular datos mensuales desde tickets
      const conteoPorMes = this.tickets.reduce((acc: any, ticket) => {
        if (ticket.fecha) {
          const fecha = new Date(ticket.fecha);
          const mes = fecha.toLocaleString('es-ES', { month: 'long' });
          acc[mes] = (acc[mes] || 0) + 1;
        }
        return acc;
      }, {});

      const mesesOrdenados = Object.keys(conteoPorMes).sort((a, b) => {
        const fechaA = new Date(a + ' 1, 2025');
        const fechaB = new Date(b + ' 1, 2025');
        return fechaA.getTime() - fechaB.getTime();
      });

      this.lineChartData.labels = mesesOrdenados;
      this.lineChartData.datasets[0].data = mesesOrdenados.map(mes =>
        conteoPorMes[mes] || 0
      );
    }
  }

  iniciarSockets() {
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    console.log("✅ Socket conectado al Dashboard");

    // ✅ CUANDO SE CREA UN NUEVO TICKET
    this.socket.on('nuevo-ticket', (ticket: any) => {
      console.log("🟢 Nuevo ticket en tiempo real:", ticket);

      this.resumen.nuevos++;
      this.resumen.total++;

      // actualizar gráfico pie
      this.pieChartData.datasets[0].data[0] = this.resumen.nuevos;
    });

    // ✅ CUANDO SE ACTUALIZA UN TICKET (por ejemplo a resuelto)
    this.socket.on('ticket-actualizado', (ticket: any) => {
      console.log("🟡 Ticket actualizado en tiempo real:", ticket);

      if (ticket.estado === 0) {
        this.resumen.resueltosHoy++;
        this.pieChartData.datasets[0].data[2]++; // cerrados
      }
      if (ticket.estado === 2) {
        this.resumen.respuestasUsuarios++;
        this.pieChartData.datasets[0].data[1]++; // en proceso
      }
    });
    this.socket.on("nuevo-ticket", (ticket: any) => {
      console.log("📌 Nuevo ticket detectado:", ticket);
      this.cargarEstadisticas();
    });

    // Cuando se actualiza (cambia de estado, prioridad, etc.)
    this.socket.on("ticket-actualizado", (ticket: any) => {
      console.log("♻ Ticket actualizado detectado:", ticket);
      this.cargarEstadisticas();

      // Actualizar eficiencia si el ticket se resolvió
      if (ticket.idEstado === 4) {
        this.cargarEficienciaTecnicos();
      }
    });
  }

  cargarEficienciaTecnicos(): void {
    this.estadisticasService.getEficienciaTecnicos().subscribe({
      next: (data: any[]) => {
        console.log('📊 Datos de eficiencia de técnicos:', data);

        // Preparar labels (nombres de técnicos) y datos (tickets resueltos)
        const labels = data.map(tecnico =>
          `${tecnico.nombres} ${tecnico.apellidos}`.trim()
        );
        const tickets = data.map(tecnico => tecnico.ticketsResueltos);

        // Actualizar el gráfico
        this.barChartData = {
          labels: labels,
          datasets: [{
            label: 'Tickets Resueltos',
            data: tickets,
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: '#22c55e',
            borderWidth: 2
          }]
        };
      },
      error: (err) => {
        console.error('❌ Error al cargar eficiencia de técnicos:', err);
      }
    });
  }


  abrirModal() {
    console.log("Abriendo modal de reporte");
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }
}
