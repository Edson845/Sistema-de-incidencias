import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-tickets-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets-details.component.html'
})
export class TicketsDetailsComponent implements OnInit {
  ticket: any;

  constructor(private route: ActivatedRoute, private ticketsService: TicketsService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.ticketsService.getTicket(id).subscribe(data => this.ticket = data);
  }
}
