import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service'; // <-- servicio para obtener rol

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.css']
})
export class TicketsListComponent implements OnInit {
  tickets: any[] = [];
  ticketsFiltrados: any[] = [];
  filtro: string = '';
  loading = true;
  error = '';

  rolUsuario: string = ''; // <-- rol del usuario actual

  constructor(
    private ticketsService: TicketsService,
    private authService: AuthService, // <-- inyectamos el servicio de auth
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el rol del usuario desde el servicio
    this.rolUsuario = this.authService.roles[0];
    this.cargarTickets();
  }

  cargarTickets() {
    this.ticketsService.obtenerMisTickets().subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos del backend:', data);
        this.tickets = data;
        this.ticketsFiltrados = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar los tickets:', err);
        this.error = 'Error al cargar los tickets.';
        this.loading = false;
      }
    });
  }

  filtrarTickets() {
    const filtroLower = this.filtro.toLowerCase();
    this.ticketsFiltrados = this.tickets.filter(t =>
      t.tituloTicket.toLowerCase().includes(filtroLower) ||
      (t.usuarioCrea && t.usuarioCrea.toLowerCase().includes(filtroLower))
    );
  }

  verTicket(id: number) {
    this.router.navigate(['/tickets', id]);
  }
  asignarTicket(id: number) {
    this.router.navigate(['/tickets', id]);
  }
  editarTicket(id: number) {
    this.router.navigate(['/tickets/detail', id]);
  }

  crearTicket() {
    this.router.navigate(['/tickets/nuevo']);
  }
}
