import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CalificarTicket } from '../calificar/calificar-ticket/calificar-ticket';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '../../services/socket.service';
import { io, Socket } from 'socket.io-client';

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
    private authService: AuthService,
    private dialog: MatDialog,
    private socketService: SocketService

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
    this.escucharNuevosComentarios(idTicket);
  }
    // tickets-details.component.ts

  isImage(archivo: string): boolean {
    return !!archivo.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/);
  }

  cargarTicket(id: number) {
    this.ticketsService.getTicket(id).subscribe({
      next: (data) => {
        console.log('✅ Ticket cargado exitosamente:', data);
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
abrirEvaluacion(ticket: any) {
  const rol = (localStorage.getItem('rol') || '').toLowerCase();

  const dialogRef = this.dialog.open(CalificarTicket, {
    width: '550px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    autoFocus: false,
    data: {
      idTicket: ticket.idTicket,
      rol,
      calificacion: ticket.calificacion,
      comentario: ticket.comentario,
      observacionTecnico: ticket.observacionTecnico
    }
  });

  dialogRef.afterClosed().subscribe(res => {
    if (!res) return;

    const formData = new FormData();
    formData.append("rol", res.rol);

    if (res.rol === 'admin') {
      formData.append("observacionTecnico", res.observacionTecnico);
      formData.append('resolvio', 'true');
    }

    this.ticketsService.calificarTicket(ticket.idTicket, formData).subscribe({
      next: () => this.cargarTicket(ticket.idTicket),
      error: (err) => console.error("Error al calificar:", err)
    });
  });
}

  cargarHistorial(id: number) {
    this.ticketsService.getHistorialCompleto(id).subscribe({
      next: (data: any[]) => {

        console.log("Historial completo:", data);

        // Guardamos el historial tal cual viene del backend
        this.historial = data || [];

        // Ordenar por fecha (ASC o DESC según tu diseño)
        this.historial.sort((a, b) =>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );

        // Aplicar filtros iniciales
        this.aplicarFiltro();
      },
      error: (err) => console.error("Error al cargar historial", err)
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

    this.ticketsService.agregarComentario(this.ticket.idTicket, formData).subscribe({
      next: () => {
        this.nuevoComentario = '';
        this.enviandoComentario = false;
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

  getStatusTitle(tipo: string, rol: string): string {
  if (tipo === 'estado') return 'Actualización de Estado';

  if (tipo === 'observacion') {
    return rol === 'Técnico' || rol === 'Tecnico'
      ? 'Observación del Técnico'
      : `Observación (${rol})`;
  }

  if (tipo === 'comentario') {
    return rol === 'Usuario'
      ? 'Comentario del Usuario'
      : rol === 'Administrador'
        ? 'Comentario del Administrador'
        : `Comentario del ${rol}`;
  }

  return 'Actualización';
}

escucharNuevosComentarios(idTicket: number) {
  this.socketService.on<any>('nuevo-comentario').subscribe((data) => {

    console.log("📥 Comentario recibido vía socket:", data);

    // Confirmar que es del ticket actual
    if (Number(data.idTicket) === idTicket && data.comentario) {

      const nuevoComentario = data.comentario;

      // Agregarlo al historial
      this.historial.push(nuevoComentario);

      // Ordenar por fecha
      this.historial.sort((a, b) =>
        new Date(a.fechaCreacion).getTime() -
        new Date(b.fechaCreacion).getTime()
      );

      // Aplicar filtro
      this.aplicarFiltro();
    }
  });
}


  volver() {
    this.router.navigate(['/tickets']);
  }
}
