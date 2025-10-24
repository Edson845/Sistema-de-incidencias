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
  ticket: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketsService: TicketsService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
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

  volver() {
    this.router.navigate(['/tickets']);
  }
}
