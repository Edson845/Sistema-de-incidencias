import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  tickets: any[] = [];
  resumen = { nuevos: 0, promedioSolucion: '0 minutos', respuestasUsuarios: 0, resueltosHoy: 0, total: 0 };

  constructor(private ticketsService: TicketsService, public authService: AuthService) {}

  ngOnInit(): void {
    this.ticketsService.getTodosTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.generarResumen();
      },
      error: (err) => console.error('Error al obtener tickets:', err)
    });
  }

  generarResumen(): void {
    const total = this.tickets.length;
    const nuevos = this.tickets.filter(t => t.estado === 'Nuevo').length;
    const resueltos = this.tickets.filter(t => t.estado === 'Cerrado').length;
    this.resumen = {
      nuevos,
      promedioSolucion: '4 minutos',
      respuestasUsuarios: 0,
      resueltosHoy: resueltos,
      total
    };
  }
}
