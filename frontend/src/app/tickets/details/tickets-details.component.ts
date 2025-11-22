import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tickets-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './tickets-details.component.html',
  styleUrls: ['./tickets-details.component.css']
})
export class TicketsDetailsComponent implements OnInit {

  ticket: any = null;
  loading = true;

  herramientas: string[] = [];
  historial: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketsService: TicketsService
  ) { }

  ngOnInit() {
    const idTicket = Number(this.route.snapshot.paramMap.get('id'));

    if (!idTicket) {
      this.loading = false;
      return;
    }

    this.cargarTicket(idTicket);
    this.cargarHerramientas(idTicket);
    this.cargarHistorial(idTicket);
  }

  cargarTicket(id: number) {
    this.ticketsService.getTicket(id).subscribe({
      next: (data) => {
        this.ticket = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar ticket', err);
        this.loading = false;
      }
    });
  }

  cargarHerramientas(id: number) {
    this.ticketsService.getHerramientasByTicket(id).subscribe({
      next: (data) => {
        try {
          this.herramientas = data;
        } catch {
          this.herramientas = [];
        }
      },
      error: (err) => console.error('Error al cargar herramientas', err)
    });
  }

  cargarHistorial(id: number) {
    this.ticketsService.getHistorialTicket(id).subscribe({
      next: (data) => {
        this.historial = data;
      },
      error: (err) => console.error('Error al cargar historial', err)
    });
  }

  estadoNombre(id: number) {
    return id === 1 ? 'Nuevo' :
      id === 2 ? 'Abierto' :
        id === 3 ? 'Pendiente' :
          id === 4 ? 'Resuelto' :
            'Cerrado';
  }

  cambiarEstado(nuevo: number) {
    if (!this.ticket) return;

    this.ticketsService.actualizarEstado(this.ticket.idTicket, nuevo)
      .subscribe({
        next: () => this.ticket.idEstado = nuevo,
        error: (err) => console.error('Error al cambiar estado', err)
      });
  }

  getBadgeClass(tipo: string): string {
    if (tipo === 'observacion') return 'badge-observacion';
    if (tipo === 'comentario') return 'badge-comentario';
    return 'badge-default';
  }

  getStatusTitle(tipo: string): string {
    if (tipo === 'observacion') return 'Observación del Técnico';
    if (tipo === 'comentario') return 'Comentario del Usuario';
    return 'Actualización';
  }

  volver() {
    this.router.navigate(['/tickets']);
  }
}
