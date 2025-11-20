import { Component, OnInit,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service'; // <-- servicio para obtener rol
import { SocketService } from '../../services/socket.service'; // ajustar ruta
import { WhatsAppService } from '../../services/whatsapp.service'; // <-- servicio de WhatsApp
import { CalificarTicket } from '../calificar/calificar-ticket/calificar-ticket';
import { MatDialog } from '@angular/material/dialog';


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
  ticketSeleccionado: number | null = null;
  listaTecnicos: any[] = [];
  tabSeleccionada = 'tecnico';
  herramientas: string[] = ['Laptop', 'Router', 'Switch', 'Cable RJ45', 'Multímetro'];
  filtroTecnico = '';
  filtroHerramienta = '';
  nuevaHerramienta = '';
  tecnicos: any[] = [];
  tecnicosFiltrados: any[] = [];
  mostrarModalAsignar: boolean = false;
  tecnicoSeleccionado: string = '';
  herramientasFiltradas: string[] = [...this.herramientas];
  herramientasSeleccionadas: string[] = [];
  tecnicoBuscado: string = '';
  herramientaBuscada: string = '';
  ordenSeleccionado: string = '';




  rolUsuario: string = ''; // <-- rol del usuario actual

  
  private subs = new Subscription();
  constructor(
    private ticketsService: TicketsService,
    private authService: AuthService, // <-- inyectamos el servicio de auth
    private router: Router,
    private socketService: SocketService,
    private WhatsappService: WhatsAppService,
    private dialog: MatDialog  // <-- inyectamos el servicio de WhatsApp

  ) {}
  
  ngOnInit(): void {
    // Obtener el rol del usuario desde el servicio
    this.rolUsuario = this.authService.roles[0];
    this.cargarTickets();
    this.subs.add(
      this.socketService.on<any>('nuevo-ticket').subscribe(ticket => {
        // lógica: recargar lista o insertar al inicio
        this.ticketsFiltrados.unshift(ticket);
        // opcional: mantener tamaño máximo o aplicar filtro
      })
    );
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
  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
    this.estadoTexto(t.idEstado).toLowerCase().includes(texto)
  );

  this.ordenarTickets();
}
estadoTexto(estado: number): string {
  return estado == 1 ? 'nuevo' :
         estado == 2 ? 'abierto' :
         estado == 3 ? 'pendiente' :
         estado == 4 ? 'resuelto' : 'cerrado';
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
  asignarTicket(idTicket: number) {
    console.log("Botón presionado")
  this.ticketSeleccionado = idTicket;
  this.mostrarModalAsignar = true;

  this.herramientasSeleccionadas = [];

  this.ticketsService.getTecnicos().subscribe({
    next: (data) => {
      console.log("✅ Técnicos cargados:", data);

      this.tecnicos = data;
      this.tecnicosFiltrados = [...data];  // ← IMPORTANTE

      // Selección por defecto
      if (this.tecnicosFiltrados.length > 0) {
        this.tecnicoSeleccionado = this.tecnicosFiltrados[0].dni;
      }
    },
    error: (err) => console.error("❌ Error al obtener técnicos:", err)
  });
}
cerrarModal() {
  this.mostrarModalAsignar = false;
  this.herramientasSeleccionadas = [];
  this.tecnicoSeleccionado = '';
}
filtrarHerramientas() {
  const texto = this.filtroHerramienta.toLowerCase();
  this.herramientasFiltradas = this.herramientas.filter(h =>
    h.toLowerCase().includes(texto)
  );
}
filtrarTecnicos() {
  const texto = this.filtroTecnico.toLowerCase();
  this.tecnicosFiltrados = this.tecnicos.filter(t =>
    t.nombres.toLowerCase().includes(texto) ||
    t.apellidos.toLowerCase().includes(texto)
  );
}
// AGREGAR NUEVA HERRAMIENTA
agregarHerramienta() {
  const herramienta = this.nuevaHerramienta.trim();

  if (!herramienta) return;

  if (!this.herramientas.includes(herramienta)) {
    this.herramientas.push(herramienta);
  }

  this.herramientasSeleccionadas.push(herramienta);
  this.nuevaHerramienta = '';
  this.filtrarHerramientas();
}

toggleHerramienta(h: string) {
  if (this.herramientasSeleccionadas.includes(h)) {
    this.herramientasSeleccionadas = this.herramientasSeleccionadas.filter(x => x !== h);
  } else {
    this.herramientasSeleccionadas.push(h);
  }
}

dniTecnicoCelular: string = ''; // Variable para almacenar el celular del técnico
confirmarAsignacion(dniTecnico: string) {
  if (!this.ticketSeleccionado) {
    console.error('No hay ticket seleccionado');
    return;
  }

  // Buscar el técnico para obtener su número de celular
  const tecnico = this.tecnicos.find(t => t.dni === dniTecnico);
  if (!tecnico) {
    console.error('Técnico no encontrado');
    return;
  }

  // 1️⃣ Asignar ticket en la base de datos
  this.ticketsService.asignarTicket(
    this.ticketSeleccionado,
    dniTecnico,
    this.herramientasSeleccionadas
  ).subscribe({
    next: () => {
      console.log('Ticket asignado en la base de datos');
      console.log("🧩 Técnico completo:", tecnico);
      console.log("📌 Numero del técnico:", tecnico.celular);
      console.log("📌 Ticket seleccionado:", this.ticketSeleccionado);

      // 2️⃣ Enviar WhatsApp al técnico
      this.WhatsappService.enviarWhatsApp(tecnico.celular,`Se te ha asignado el ticket #${this.ticketSeleccionado}`
      ).subscribe({
        next: () => console.log('WhatsApp enviado correctamente'),
        error: (err) => console.error('Error enviando WhatsApp:', err)
      });

      // Cierre del modal y recarga
      alert("✅ Ticket asignado correctamente");
      this.mostrarModalAsignar = false;
      this.cargarTickets();
    },
    error: (err) => {
      console.error('Error asignando ticket:', err);
      alert('❌ Error al asignar el ticket');
    }
  });
}

  cerrarTicket(idTicket: number) {

  }
  verTicket(id: number) {
    this.router.navigate(['/tickets', id]);
  }
  abrirEvaluacion(idTicket: number) {
    const rol = localStorage.getItem('rol')|| ''.toLowerCase();
    const dialogRef = this.dialog.open(CalificarTicket, {
      width: '500px',
      data: { idTicket, rol}
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log('Calificación cerrada:', res);
      this.cargarTickets(); // si quieres refrescar
    });
  }


  crearTicket() {
    this.router.navigate(['/tickets/nuevo']);
  }
}



