import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { io, Socket } from 'socket.io-client';
import { ObservacionTecnico } from '../observacion-tecnico/observacion-tecnico';

import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { CalificarTicket } from '../calificar/calificar-ticket/calificar-ticket';
import { environment } from '../../environments/environments';
import { Asignar } from '../asignar/asignar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MatIconModule],
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.css']
})
export class TicketsListComponent implements OnInit, OnDestroy {

  private socket!: Socket;
  tickets: any[] = [];
  ticketsFiltrados: any[] = [];
  filtro: string = '';
  loading = true;
  error = '';
  rolUsuario: string = '';
  ordenSeleccionado: string = '';
  herramientas: string[] = ['Laptop', 'Router', 'Switch', 'Cable RJ45', 'Multímetro'];


  private subs = new Subscription();

  constructor(
    private ticketsService: TicketsService,
    private authService: AuthService,
    private router: Router,
    private socketService: SocketService,
    private WhatsappService: WhatsAppService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.rolUsuario = this.authService.roles[0];
    this.iniciarSocket();
    this.cargarTickets();

    this.subs.add(
      this.socketService.on<any>('nuevo-ticket').subscribe(ticket => {
        this.ticketsFiltrados.unshift(ticket);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.socket) this.socket.disconnect();
  }

  cargarTickets() {
    this.ticketsService.obtenerMisTickets().subscribe({
      next: (data) => {
        // 🔥 Ordenar por fecha DESC (más actual primero)
        data.sort((a: any, b: any) => {
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        });

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
    const texto = this.filtro.toLowerCase().trim();
    this.ticketsFiltrados = this.tickets.filter(t =>
      t.tituloTicket.toLowerCase().includes(texto) ||
      t.descTicket.toLowerCase().includes(texto) ||
      (t.nombreUsuario?.toLowerCase().includes(texto)) ||
      (t.apellidoUsuario?.toLowerCase().includes(texto)) ||
      (t.nombreTecnico?.toLowerCase().includes(texto)) ||
      (t.apellidoTecnico?.toLowerCase().includes(texto)) ||
      t.nombreCategoria?.toLowerCase().includes(texto) ||
      this.estadoTexto(t.idEstado).toLowerCase().includes(texto) ||
      this.prioridadTexto(t.idPrioridad).toLowerCase().includes(texto)
    );
    this.ordenarTickets();
  }
  prioridadTexto(prioridad: number): string {
    return prioridad == 1 ? 'muy baja' :
      prioridad == 2 ? 'baja' :
        prioridad == 3 ? 'media' :
          prioridad == 4 ? 'alta' :
            prioridad == 5 ? 'muy alta' :
                'desconocido';
  }
  estadoTexto(estado: number): string {
    return estado == 1 ? 'nuevo' :
      estado == 2 ? 'abierto' :
        estado == 3 ? 'proceoso' :
          estado == 4 ? 'resuelto' :
            estado == 5 ? 'cerrado' :
              estado == 6 ? 'no procede' :
                'desconocido';
  }

  ordenarTickets() {
    if (this.ordenSeleccionado === 'prioridad') {
      this.ticketsFiltrados.sort((a, b) => b.idPrioridad - a.idPrioridad);
    }
    if (this.ordenSeleccionado === 'fecha') {
      this.ticketsFiltrados.sort((a, b) =>
        new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      );
    }
    if (this.ordenSeleccionado === 'estado') {
      this.ticketsFiltrados.sort((a, b) => a.idEstado - b.idEstado);
    }
  }

  solucionarTicket(idTicket: number) {
    this.ticketsService.actualizarEstado(idTicket, 3).subscribe({
      next: () => { this.cargarTickets(); },
      error: (err) => console.error('❌ Error al actualizar estado del ticket:', err)
    });
  }
  cerrarTicket(idTicket: number){
    this.ticketsService.actualizarEstado(idTicket, 4).subscribe({
      next: () => { this.cargarTickets(); },
      error: (err) => console.error('❌ Error al actualizar estado del ticket:', err)
    });
  }

  verTicket(id: number) {
    this.router.navigate(['/tickets', id]);
  }

  abrirEvaluacionUsuario(idTicket: number) {
  const dialogRef = this.dialog.open(CalificarTicket, {
    width: '500px',
    data: { idTicket, rol: 'usuario' }
  });

  dialogRef.afterClosed().subscribe(res => {
    if (!res) return;

    const formData = new FormData();
    formData.append("rol", "usuario");
    formData.append("calificacion", res.calificacion);
    formData.append("comentario", res.comentario);

    if (res.archivos?.length > 0) {
      res.archivos.forEach((file: File) => formData.append("fotos", file));
    }

    this.ticketsService.calificarTicket(idTicket, formData).subscribe({
      next: () => this.cargarTickets(),
      error: (err) => console.error("Error al calificar (usuario):", err)
    });
  });
}
abrirObservacionTecnico(idTicket: number) {
  const dialogRef = this.dialog.open(ObservacionTecnico, {
    width: '450px',
    data: { idTicket }
  });

  dialogRef.afterClosed().subscribe(res => {
    if (!res) return;

    const formData = new FormData();
    formData.append("rol", "tecnico");
    formData.append("observacionTecnico", res.observacion);
    formData.append("resolvio", "true");

    this.ticketsService.ObservacionTicket(idTicket, formData).subscribe({
      next: () => this.cargarTickets(),
      error: (err) => console.error("Error al resolver ticket:", err)
    });
  });
}


  crearTicket() {
    this.router.navigate(['/tickets/nuevo']);
  }
  
  asignarTicket(idTicket: number) {
    const dialogRef = this.dialog.open(Asignar, {
      width: '500px',
      data: {
        ticketSeleccionado: idTicket,
        herramientas: this.herramientas
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.ticketAsignado) {
        this.cargarTickets();
      }
    });
  }

  iniciarSocket() {
    this.socket = io(environment.socketUrl, { transports: ['websocket'], autoConnect: true });

    // 🔥 NUEVO TICKET CREADO
    this.socket.on("nuevo-ticket", (ticket: any) => {
      console.log('📥 Nuevo ticket recibido:', ticket);
      if (!this.tickets.some(t => t.idTicket === ticket.idTicket)) {
        this.tickets.unshift(ticket);
        this.filtrarTickets(); // Actualizar lista filtrada
      }
    });

    // 🔥 TICKET ACTUALIZADO (cualquier campo)
    this.socket.on("ticket-actualizado", (ticketActualizado: any) => {
      console.log('🔄 Ticket actualizado recibido:', ticketActualizado);

      const index = this.tickets.findIndex(t => t.idTicket === Number(ticketActualizado.idTicket));

      if (index !== -1) {
        // Reemplazar completamente el ticket con los nuevos datos
        this.tickets[index] = ticketActualizado;
      } else {
        // Si no existe, agregarlo (por si acaso)
        this.tickets.unshift(ticketActualizado);
      }

      // Actualizar lista filtrada
      this.filtrarTickets();
    });

    // 🔥 TICKET ELIMINADO
    this.socket.on("ticket-eliminado", (idEliminado: number) => {
      console.log('🗑️ Ticket eliminado:', idEliminado);
      this.tickets = this.tickets.filter(t => t.idTicket !== idEliminado);
      this.filtrarTickets(); // Actualizar lista filtrada
    });
  }

}
