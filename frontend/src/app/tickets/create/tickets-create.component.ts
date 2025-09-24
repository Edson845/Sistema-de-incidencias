import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-tickets-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets-create.component.html'
})
export class TicketsCreateComponent {
  titulo = '';
  descripcion = '';

  constructor(private ticketsService: TicketsService) {}

  crearTicket() {
    this.ticketsService.crearTicket({ titulo: this.titulo, descripcion: this.descripcion })
      .subscribe(() => {
        alert('Ticket creado correctamente');
        this.titulo = '';
        this.descripcion = '';
      });
  }
}
