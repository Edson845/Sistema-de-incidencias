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
  constructor(public ticketsService: TicketsService, public authService: AuthService) {}
  ngOnInit(): void {
    if (this.authService.rol === 'admin') {
      this.ticketsService.getTodosTickets().subscribe((data: any) => this.tickets = data);
    } else {
      this.ticketsService.getTodosTickets().subscribe((data: any) => this.tickets = data);
    }
  }
}
