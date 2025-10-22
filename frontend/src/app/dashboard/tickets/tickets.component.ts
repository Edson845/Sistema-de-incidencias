import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, SidebarComponent, NgChartsModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

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
    labels: ['Alta', 'Media', 'Baja'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'] }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Tickets por mes',
      data: [],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false } }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets(): void {
    // 📡 Reemplaza esta URL si tu API es diferente
    this.http.get<any[]>(`${environment.apiUrl}/resumen`).subscribe({
      next: (data) => {
        this.tickets = data;
        this.generarResumen();
        this.actualizarGraficos();
      },
      error: (err) => {
        console.error('Error al obtener tickets:', err);
      }
    });
  }

  generarResumen(): void {
    const total = this.tickets.length;
    const nuevos = this.tickets.filter(t => t.estado?.toLowerCase() === 'nuevo').length;
    const resueltos = this.tickets.filter(t => t.estado?.toLowerCase() === 'cerrado').length;

    const hoy = new Date().toISOString().split('T')[0];
    const resueltosHoy = this.tickets.filter(t => t.fecha === hoy && t.estado?.toLowerCase() === 'cerrado').length;

    this.resumen = {
      nuevos,
      promedioSolucion: '40 min',
      respuestasUsuarios: 5,
      resueltosHoy,
      total
    };
  }

  actualizarGraficos(): void {
    // 🔹 PieChart - tickets por nivel de prioridad (si existe campo)
    const alta = this.tickets.filter(t => t.prioridad === 'Alta').length;
    const media = this.tickets.filter(t => t.prioridad === 'Media').length;
    const baja = this.tickets.filter(t => t.prioridad === 'Baja').length;

    this.pieChartData.datasets[0].data = [alta, media, baja];

    // 🔸 LineChart - tickets creados por mes
    const conteoPorMes: { [key: string]: number } = {};

    this.tickets.forEach(t => {
      if (t.fecha) {
        const mes = new Date(t.fecha).toLocaleString('es-ES', { month: 'short' });
        conteoPorMes[mes] = (conteoPorMes[mes] || 0) + 1;
      }
    });

    this.lineChartData.labels = Object.keys(conteoPorMes);
    this.lineChartData.datasets[0].data = Object.values(conteoPorMes);
  }
}
