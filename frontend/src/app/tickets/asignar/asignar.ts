import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketsService } from '../../services/tickets.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-asignar-ticket-modal',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './asignar.html',
  styleUrls: ['./asignar.css']
})
export class Asignar {
  ticketSeleccionado: number;
  tecnicos: any[] = [];
  tecnicosFiltrados: any[] = [];
  tecnicoSeleccionado: string = '';
  filtroTecnico: string = '';
  filtroHerramienta: string = '';
  herramientasFiltradas: string[] = [];
  herramientasSeleccionadas: string[] = [];
  nuevaHerramienta: string = '';
  mostrarModalAsignar = true;
  tabSeleccionada = 'tecnico';
  herramientas: string[] = ['Laptop', 'Router', 'Switch', 'Cable RJ45', 'Multímetro'];

  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<Asignar>,
    private ticketsService: TicketsService,
    private whatsappService: WhatsAppService,
    private UsuariosService: UsuariosService
  ) {
    this.ticketSeleccionado = data.ticketSeleccionado;
    this.herramientas = data.herramientas;
    this.herramientasFiltradas = [...this.herramientas];
    this.cargarTecnicos();
  }
  
  cargarTecnicos() {
    this.UsuariosService.getTecnicos().subscribe({
      next: (data) => {
        this.tecnicos = data;
        this.tecnicosFiltrados = [...data];
        if (this.tecnicosFiltrados.length > 0) this.tecnicoSeleccionado = this.tecnicosFiltrados[0].dni;
      },
      error: (err) => console.error("❌ Error al obtener técnicos:", err)
    });
  }

  filtrarTecnicos() {
    const texto = this.filtroTecnico.toLowerCase();
    this.tecnicosFiltrados = this.tecnicos.filter(t =>
      t.nombres.toLowerCase().includes(texto) || t.apellidos.toLowerCase().includes(texto)
    );
  }
  
  filtrarHerramientas() {
    const texto = this.filtroHerramienta.toLowerCase();
    this.herramientasFiltradas = this.herramientas.filter(h => h.toLowerCase().includes(texto));
  }

  agregarHerramienta() {
    const herramienta = this.nuevaHerramienta.trim();
    if (!herramienta) return;
    if (!this.herramientas.includes(herramienta)) this.herramientas.push(herramienta);
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

  confirmarAsignacion(dniTecnico: string) {
    const tecnico = this.tecnicos.find(t => t.dni === dniTecnico);
    if (!tecnico) return;

    this.ticketsService.asignarTicket(this.ticketSeleccionado, dniTecnico, this.herramientasSeleccionadas)
      .subscribe({
        next: () => {
          this.whatsappService.enviarWhatsApp(tecnico.celular, `Se te ha asignado el ticket #${this.ticketSeleccionado}`).subscribe();
          this.dialogRef.close({ ticketAsignado: true });
        },
        error: (err) => console.error('❌ Error al asignar ticket:', err)
      });
  }

  cerrarModal() {
    this.dialogRef.close();
  }
}

