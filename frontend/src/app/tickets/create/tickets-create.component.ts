import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService } from '../../services/tickets.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tickets-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets-create.component.html',
  styleUrls: ['./tickets-create.component.css']
})
export class TicketsCreateComponent {
  titulo = '';
  descripcion = '';
  prioridad = 'Media';
  mensaje = '';

  constructor(private ticketsService: TicketsService, private router: Router) {}

  crearTicket() {
    const nuevo = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      prioridad: this.prioridad,
      estado: 'Abierto'
    };

    this.ticketsService.crearTicket(nuevo).subscribe({
      next: () => {
        this.mensaje = 'Ticket creado correctamente ✅';
        setTimeout(() => this.router.navigate(['/tickets']), 1500);
      },
      error: () => (this.mensaje = 'Error al crear el ticket ❌')
    });
  }
}
