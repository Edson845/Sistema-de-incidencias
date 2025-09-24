import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets-list.component.html'
})
export class TicketsListComponent implements OnInit {
  tickets: any[] = [];

  constructor(private ticketsService: TicketsService) {}

  ngOnInit(): void {
    this.ticketsService.getTodosTickets().subscribe((data: any) => this.tickets = data);
  }
}
