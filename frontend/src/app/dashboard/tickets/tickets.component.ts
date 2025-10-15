import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  tickets: any[] = [];

  // 🔹 Información del usuario
  usuario = {
    nombre: '',
    rol: ''
  };

  // 🔹 Resumen general
  resumen = {
    nuevos: 0,
    promedioSolucion: '0 minutos',
    respuestasUsuarios: 0,
    resueltosHoy: 0,
    total: 0
  };

  // 🔹 Datos para los gráficos
  estadoSolicitudes: any[] = [];
  problemasFrecuentes: any[] = [];
  agentesActivos: any[] = [];

  constructor(
    private ticketsService: TicketsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Cargar datos del usuario actual
    this.usuario = {
      nombre: this.authService.token || 'token',
      rol: this.authService.rol || 'Empleado'
    };

    // Obtener todos los tickets
    this.ticketsService.getTodosTickets().subscribe({
      next: (data: any[]) => {
        this.tickets = data;
        this.generarResumen();
        this.generarGraficos();
      },
      error: (err) => console.error('Error al obtener tickets:', err)
    });
  }

  // 🔹 Generar datos del resumen general
  generarResumen(): void {
    const total = this.tickets.length;
    const nuevos = this.tickets.filter(t => t.estado === 'Nuevo').length;
    const resueltos = this.tickets.filter(t => t.estado === 'Cerrado').length;

    this.resumen = {
      nuevos,
      promedioSolucion: '4 minutos', // Puedes calcularlo según tus datos reales
      respuestasUsuarios: 0,
      resueltosHoy: resueltos,
      total
    };
  }

  // 🔹 Generar datos de ejemplo para los gráficos
  generarGraficos(): void {
    this.estadoSolicitudes = [
      { nombre: 'Asignado', cantidad: this.tickets.filter(t => t.estado === 'Asignado').length, color: '#4CAF50' },
      { nombre: 'En progreso', cantidad: this.tickets.filter(t => t.estado === 'En progreso').length, color: '#FF9800' },
      { nombre: 'Nuevo', cantidad: this.tickets.filter(t => t.estado === 'Nuevo').length, color: '#2196F3' },
      { nombre: 'Cerrado', cantidad: this.tickets.filter(t => t.estado === 'Cerrado').length, color: '#9E9E9E' }
    ];

    // Problemas más frecuentes (solo ejemplo)
    this.problemasFrecuentes = [
      { nombre: 'Problema 1', porcentaje: 70, color: '#2196F3' },
      { nombre: 'Problema 2', porcentaje: 50, color: '#FF9800' },
      { nombre: 'Problema 3', porcentaje: 30, color: '#4CAF50' },
      { nombre: 'Problema 4', porcentaje: 20, color: '#9E9E9E' }
    ];

    // Agentes activos (puedes mapear desde tus tickets)
    this.agentesActivos = [
      { nombre: 'Esteban Merino', tickets: 2, color: '#4CAF50' },
      { nombre: 'Hugo Cárdenas', tickets: 0, color: '#9E9E9E' },
      { nombre: 'Andrea Gómez', tickets: 0, color: '#9E9E9E' },
      { nombre: 'Luisa Ríos', tickets: 0, color: '#9E9E9E' }
    ];
  }
}
