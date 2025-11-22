import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketsService } from '../../services/tickets.service';

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

  // 🔹 Agrega esta línea — es la que faltaba:
  imagenPreview: string | null = null;

  constructor(private fb: FormBuilder, private ticketService: TicketsService) {}

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
        alert('✅ Ticket registrado correctamente');
        this.ticketForm.reset();
        this.archivos = [];
        this.imagenPreview = null;
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al registrar el ticket');
      }
    });
  }
}
