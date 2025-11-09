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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketsService: TicketsService
  ) {}

  ngOnInit() {
    const idTicket = Number(this.route.snapshot.paramMap.get('id'));

    if (!idTicket) {
      this.loading = false;
      return;
    }

    this.cargarTicket(idTicket);
    this.cargarHerramientas(idTicket);
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

  volver() {
    this.router.navigate(['/tickets']);
  }
}
