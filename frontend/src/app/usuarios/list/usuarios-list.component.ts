import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css']
})
export class UsuariosListComponent implements OnInit {
  usuarios: any[] = [];
  loading = true;
  error = '';

  // Campo para buscar usuarios
  filtro = '';

  constructor(private usuariosService: UsuariosService, private router: Router) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
  this.usuariosService.getUsuarios().subscribe({
    next: (data) => {
      console.log('Usuarios cargados desde API:', data);
      this.usuarios = Array.isArray(data)
        ? data
        : (data?.usuarios ?? []); // usa el arreglo si está dentro de data.usuarios o [] si es null
      this.loading = false;
    },
    error: (err) => {
      console.error('Error al cargar usuarios:', err);
      this.error = err.error?.mensaje || 'Error al cargar usuarios';
      this.loading = false;
    }
  });
}
  agregarUsuario() {
    this.router.navigate(['/usuarios/nuevo']);
  }

  verDetalle(id: number) {
    this.router.navigate(['usuarios/:id', id]);
  }

  editarUsuario(id: number) {
    this.router.navigate(['/usuarios/editar', id]);
  }

  // 🔍 Filtro básico en memoria
  get usuariosFiltrados() {
  const texto = this.filtro.toLowerCase().trim();

  return this.usuarios.filter((u) =>
    u.nombres?.toLowerCase().includes(texto) ||
    u.apellidos?.toLowerCase().includes(texto) ||
    u.correo?.toLowerCase().includes(texto) ||
    u.dni?.toString().includes(texto) || // 🔹 busca por DNI
    u.usuario?.toLowerCase().includes(texto) // 🔹 busca por usuario
  );
}

}
