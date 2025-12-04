import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketsService } from '../../services/tickets.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './tickets-create.component.html',
  styleUrls: ['./tickets-create.component.css']
})
export class TicketsCreateComponent implements OnInit {
  ticketForm!: FormGroup;
  archivos: File[] = [];
  categorias: any[] = [];

  // Vista previa de imagen
  imagenPreview: string | null = null;

  // Sistema de notificaciones
  mensaje = '';
  tipoMensaje = '';

  constructor(private fb: FormBuilder, private ticketService: TicketsService, private router: Router) { }

  ngOnInit(): void {
    this.ticketForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(300)]],
      idCategoria: ['', Validators.required],
      adjunto: ['']
    });
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.ticketService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al obtener categorías:', err);
      }
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.archivos = Array.from(files);
      const file = files[0];

      this.ticketForm.patchValue({ adjunto: file.name });
      this.ticketForm.get('adjunto')?.updateValueAndValidity();

      // 🔹 Genera la vista previa si es imagen
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagenPreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.imagenPreview = null;
      }
    } else {
      this.archivos = [];
      this.imagenPreview = null;
      this.ticketForm.patchValue({ adjunto: '' });
    }
  }
  volver() {
    this.router.navigate(['/tickets']);
  }
  registrarTicket() {
    console.log('✅ registrarTicket() ejecutado');
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.ticketForm.value.titulo);
    formData.append('descripcion', this.ticketForm.value.descripcion);
    formData.append('idCategoria', this.ticketForm.value.idCategoria);

    this.archivos.forEach(file => {
      formData.append('archivos', file);
    });

    this.ticketService.crearTicket(formData).subscribe({
      next: (res) => {
        this.mostrarMensaje('Ticket creado correctamente', 'success');
        this.ticketForm.reset();
        this.archivos = [];
        this.imagenPreview = null;
        setTimeout(() => this.router.navigate(['/tickets']), 1500);
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al crear el ticket', 'error');
      }
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 3000);
  }
}
