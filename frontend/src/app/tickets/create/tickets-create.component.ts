import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true, // 👈 IMPORTANTE si no usas NgModule
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule  
  ],
  templateUrl: './tickets-create.component.html',
  styleUrls: ['./tickets-create.component.css']
})
export class TicketsCreateComponent implements OnInit {
  ticketForm!: FormGroup;
  archivos: File[] = [];

  constructor(private fb: FormBuilder, private ticketService: TicketsService) {}
categorias: any[] = [];
  ngOnInit(): void {
  this.ticketForm = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(300)]],
    tipo: ['', Validators.required],
    idCategoria: ['', Validators.required],
    nivel: ['', Validators.required]
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
    this.archivos = Array.from(event.target.files);
  }

  registrarTicket() {
    console.log('✅ registrarTicket() ejecutado'); // <-- Prueba
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }
    console.log('📦 Datos del formulario:', this.ticketForm.value);
    const formData = new FormData();
    
    formData.append('titulo', this.ticketForm.value.titulo);
    formData.append('descripcion', this.ticketForm.value.descripcion);
    formData.append('idCategoria', this.ticketForm.value.idCategoria);
    formData.append('nivel', this.ticketForm.value.nivel);

    this.archivos.forEach(file => {
      formData.append('archivos', file);
    });
    console.log('📦 Enviando al backend...');
      for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    this.ticketService.crearTicket(formData).subscribe({
      next: (res) => {
        alert('✅ Ticket registrado correctamente');
        this.ticketForm.reset();
        this.archivos = [];
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al registrar el ticket');
      }
    });
  }
}

