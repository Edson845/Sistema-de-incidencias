import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsService } from '../../services/tickets.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.css']
})
export class TicketsListComponent implements OnInit {
  tickets: any[] = [];
  loading = true;
  error = '';

  constructor(private ticketsService: TicketsService, private router: Router) {}

  ngOnInit() {
    this.cargarTickets();
  }

  cargarTickets() {
    this.ticketsService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los tickets';
        this.loading = false;
      }
    });
  }

  verTicket(id: number) {
    this.router.navigate(['/tickets', id]);
  }

  crearTicket() {
    this.router.navigate(['/tickets/nuevo']);
  }
}
