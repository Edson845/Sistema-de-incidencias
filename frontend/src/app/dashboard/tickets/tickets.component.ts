import { Component, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { AuthService } from '../../services/auth.service';
import { EstadisticasService } from '../../services/estadisticas.service';
import { io, Socket } from "socket.io-client";


@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, NgChartsModule,FormsModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit, OnDestroy {
  private socket!: Socket;

  tabActiva: 'pdf' | 'excel' = 'pdf';
  modalAbierto = false;
  filtros = {
    fechaInicio: '',
    fechaFin: '',
    area: ''
  };
  listaAreas = [
    "Sistemas",
    "Logística",
    "Mantenimiento",
    "Almacén",
    "Gerencia",
    "Mesa de partes"
  ];
  tickets: any[] = [];
  resumen = {
    nuevos: 0,
    promedioSolucion: '—',
    respuestasUsuarios: 0,
    resueltosHoy: 0,
    total: 0
  };

  // 🔹 Gráficos
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Nuevos', 'En Proceso', 'Cerrados'],
    datasets: [{ 
      data: [0, 0, 0], 
      backgroundColor: ['#f59e0b', '#2563eb', '#22c55e']
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
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

  constructor(
    private http: HttpClient, 
    public authService: AuthService,
    private estadisticasService: EstadisticasService
  ) { }

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.iniciarSockets();
  }
  ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
  }

  cargarEstadisticas(): void {
    const token = this.authService.obtenerToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    // Obtener tickets y estadísticas
    this.http.get<any>(`${environment.apiUrl}/tickets/estadisticas/generales`, { headers }).subscribe({
      next: (data: any) => {
        console.log('Datos recibidos:', data); // Para debug
        
        // Actualizar contadores de resumen
        const porEstado = data.porEstado || [];
        this.resumen = {
          nuevos: porEstado.find((e: any) => e.estado === 1)?.cantidad || 0,
          promedioSolucion: '40 min',
          respuestasUsuarios: porEstado.find((e: any) => e.estado === 2)?.cantidad || 0,
          resueltosHoy: data.resueltosHoy || 0,
          total: porEstado.reduce((sum: number, e: any) => sum + e.cantidad, 0)
        };
        
        // Actualizar gráfico de pie con datos de estado
        const estadoData = {
          nuevos: porEstado.find((e: any) => e.estado === 1)?.cantidad || 0,
          enProceso: porEstado.find((e: any) => e.estado === 2)?.cantidad || 0,
          cerrados: porEstado.find((e: any) => e.estado === 0)?.cantidad || 0
        };

        // Para debug
        console.log('Estado Data:', estadoData);
        console.log('Tickets por mes:', data.ticketsPorMes);

        // Actualizar gráfico de pie
        this.pieChartData = {
          labels: ['Nuevos', 'En Proceso', 'Cerrados'],
          datasets: [{
            data: [estadoData.nuevos, estadoData.enProceso, estadoData.cerrados],
            backgroundColor: ['#f59e0b', '#2563eb', '#22c55e']
          }]
        };

        // Actualizar gráfico de línea con datos mensuales
        if (data.ticketsPorMes) {
          const meses = Object.keys(data.ticketsPorMes);
          const cantidades = Object.values(data.ticketsPorMes) as number[];
          
          // Para debug
          console.log('Meses:', meses);
          console.log('Cantidades:', cantidades);

          this.lineChartData = {
            labels: meses,
            datasets: [{
              label: 'Cantidad de Tickets',
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
        console.error('Error al obtener tickets:', err);
        this.generarResumen(); // Generar resumen con datos vacíos como respaldo
      }
    });
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
        if (estado === 'pendiente' || estado === '1' || estado === 'nuevo') {
          acc.pendiente = (acc.pendiente || 0) + item.cantidad;
        } else if (estado === 'en proceso' || estado === '2') {
          acc.enProceso = (acc.enProceso || 0) + item.cantidad;
        } else if (estado === 'cerrado' || estado === '0' || estado === 'resuelto') {
          acc.cerrado = (acc.cerrado || 0) + item.cantidad;
        }
        return acc;
      }, {});

      this.pieChartData.datasets[0].data = [
        estadoData.pendiente || 0,
        estadoData.enProceso || 0,
        estadoData.cerrado || 0
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
    });
  }
  // REPORTE: solo para admins — trae usuarios con rol admin (usa endpoint protegido)
  reporteAdmins: any[] = [];
  reporteVisible = false;
  
  
  hacerReporte() {
    const token = this.authService.obtenerToken();
    if (!token) return alert('Debes iniciar sesión');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.estadisticasService.getUsuariosPorRol().subscribe({
      next: (res) => {
        this.reporteAdmins = res.filter((r: any) => (r.rol || '').toLowerCase() === 'admin');
        this.reporteVisible = true;
      },
      error: (err) => {
        console.error('Error al generar reporte:', err);
        alert('No autorizado para generar el reporte o error del servidor');
      }
    });
  }
  abrirModal() {
    this.modalAbierto = true;
  }
  
  cerrarModal() {
    this.modalAbierto = false;
  }
  
  generarPDF() {
    console.log("Generando PDF...");
    // Llamas a tu backend
  }
  
  generarExcel() {
    console.log("Generando Excel...");
    // Llamas a tu backend
  }
}

