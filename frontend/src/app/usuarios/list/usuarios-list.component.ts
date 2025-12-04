import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../services/catalogos.service';

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
  cargos: any[] = [];

  // Campo para buscar usuarios
  filtro = '';

  // Sistema de notificaciones
  mensaje = '';
  tipoMensaje = '';

  // Modal de confirmación
  mostrarModalEliminar = false;
  dniAEliminar = '';

  constructor(private usuariosService: UsuariosService, private router: Router, private CatalogoService: CatalogoService) { }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarCargos();
  }

  cargarCargos() {
    this.CatalogoService.obtenerCargos().subscribe({
      next: (data) => {
        this.cargos = data;
      },
      error: (err) => {
        console.error('Error al cargar Cargos:', err);
      }
    });
  }
  getNombreCargo(idCargo: number): string {
    const cargo = this.cargos.find(c => c.idCargo === idCargo);
    return cargo ? cargo.nombreCargo : 'Sin cargo';
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
    this.router.navigate(['usuarios/nuevo']);
  }

  verDetalle(dni: string) {
    this.router.navigate(['/usuario/perfil']);
  }

  editarUsuario(dni: string) {
    this.router.navigate(['/usuarios/editar', dni]);
  }

  abrirModalEliminar(dni: string) {
    this.dniAEliminar = dni;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.dniAEliminar = '';
  }

  confirmarEliminar() {
    this.usuariosService.eliminarUsuario(this.dniAEliminar).subscribe({
      next: () => {
        this.mostrarMensaje('Usuario eliminado correctamente', 'success');
        this.cargarUsuarios();
        this.cerrarModalEliminar();
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.mostrarMensaje('Error al eliminar usuario', 'error');
        this.cerrarModalEliminar();
      }
    });
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

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.error = '';
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 3000);
  }

}
