import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tickets-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './tickets-details.component.html',
  styleUrls: ['./tickets-details.component.css']
})
export class TicketsDetailsComponent implements OnInit {

  ticket: any = null;
  loading = true;
  rolUsuario: string = '';

  herramientas: any[] = [];
  historial: any[] = [];
  historialFiltrado: any[] = [];
  filtroActivo: string = 'todos'; // 'todos', 'comentario', 'observacion'

  nuevoComentario: string = '';
  enviandoComentario: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketsService: TicketsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const datos = this.authService.obtenerDatosUsuario;
    if (datos && datos.rol) {
      this.rolUsuario = datos?.rol
        ? String(datos.rol).toLowerCase()
        : '';
    }

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
      next: (data: any) => {
        this.herramientas = data;
        console.log('✅ Herramientas cargadas exitosamente:', this.herramientas);
      },
      error: (err) => {
        console.error('❌ Error al cargar herramientas para el ticket', id, err);
        this.herramientas = [];
      }
    });
  }

  cargarHistorial(id: number) {
    this.ticketsService.getHistorialTicket(id).subscribe({
      next: (data) => {
        this.historial = data;
        this.aplicarFiltro();
      },
      error: (err) => console.error('Error al cargar historial', err)
    });
  }

  aplicarFiltro() {
    if (this.filtroActivo === 'todos') {
      this.historialFiltrado = this.historial;
    } else {
      this.historialFiltrado = this.historial.filter(item => item.tipo === this.filtroActivo);
    }
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo = filtro;
    this.aplicarFiltro();
  }

  agregarComentario() {
    if (!this.nuevoComentario.trim() || !this.ticket) {
      return;
    }

    this.enviandoComentario = true;

    const formData = new FormData();
    formData.append('rol', 'usuario');
    formData.append('comentario', this.nuevoComentario);
    formData.append('calificacion', '0'); // Valor por defecto

    this.ticketsService.calificarTicket(this.ticket.idTicket, formData).subscribe({
      next: () => {
        this.nuevoComentario = '';
        this.enviandoComentario = false;
        // Recargar historial
        this.cargarHistorial(this.ticket.idTicket);
      },
      error: (err) => {
        console.error('Error al agregar comentario', err);
        this.enviandoComentario = false;
      }
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
