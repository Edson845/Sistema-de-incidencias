import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PerfilService } from '../services/perfil.service';
import { UsuariosService } from '../services/usuarios.service';
import Swal from 'sweetalert2';

// Material Design
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule
  ],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {

  perfil: any = {
    dni: '',
    usuario: '',
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    avatar: '',
    idCargo: '',
    nombreCargo: '',
    nombreOficina: ''
  };

  modalContrasenia = false;

  formContrasenia = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  editMode: boolean = false;
  avatarFile!: File;
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  // Modo solo lectura para admin viendo otros usuarios
  modoSoloLectura = false;
  dniVisualizando: string | null = null;
  esAdmin = false;
  rolUsuario: string = '';
  constructor(
    private usuariosService: UsuariosService,
    private PerfilService: PerfilService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {
    // Detectar si el usuario actual es admin
    this.esAdmin = this.authService.tieneRol('admin');
  }

  ngOnInit() {
    // Verificar si hay DNI en la ruta (admin viendo otro usuario)
    this.dniVisualizando = this.route.snapshot.paramMap.get('dni');
    this.rolUsuario = this.authService.roles[0];
    if (this.dniVisualizando) {
      // Modo admin: ver perfil de otro usuario (solo lectura)
      this.modoSoloLectura = true;
      this.cargarPerfilPorDni(this.dniVisualizando);
    } else {
      // Modo normal: ver mi propio perfil
      this.cargarPerfil();
    }
  }

  cargarPerfil() {
    this.PerfilService.getPerfil().subscribe(data => {
      this.perfil = data;
    });
  }

  cargarPerfilPorDni(dni: string) {
    this.usuariosService.getUsuario(dni).subscribe({
      next: (data) => {
        this.perfil = data;
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo cargar el perfil del usuario', 'error');
        this.volver();
      }
    });
  }

  volver() {
    // Admin vuelve a lista de usuarios, otros roles vuelven a tickets
    if (this.esAdmin) {
      this.router.navigate(['/usuarios']);
    } else {
      this.router.navigate(['/tickets']);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;

    // Leer archivo local como URL temporal
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  activarEdicion() {
    this.editMode = true;
  }

  cancelarEdicion() {
    this.editMode = false;
    this.previewUrl = null;
    this.selectedFile = null;
    this.cargarPerfil();
  }

  actualizarPerfil() {
    const data = {
      usuario: this.perfil.usuario,
      celular: this.perfil.celular,
      correo: this.perfil.correo,
      nombres: this.perfil.nombres,
      apellidos: this.perfil.apellidos
    };

    this.PerfilService.actualizarPerfil(data).subscribe({
      next: () => {
        // Si el usuario cambió avatar
        if (this.selectedFile) {
          this.PerfilService.actualizarAvatar(this.perfil.dni, this.selectedFile)
            .subscribe({
              next: () => {
                Swal.fire("Éxito", "Perfil y avatar actualizados", "success");
                this.editMode = false;
                this.previewUrl = null;
                this.selectedFile = null;
                this.cargarPerfil();
              },
              error: (err) => {
                console.error('Error al actualizar avatar:', err);
                Swal.fire("Éxito", "Perfil actualizado, pero hubo un error al actualizar el avatar", "warning");
                this.editMode = false;
                this.cargarPerfil();
              }
            });
        } else {
          Swal.fire("Éxito", "Perfil actualizado", "success");
          this.editMode = false;
          this.cargarPerfil();
        }
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
        Swal.fire("Error", "No se pudo actualizar el perfil", "error");
      }
    });
  }

  abrirModalContrasenia() {
    this.modalContrasenia = true;
  }

  cerrarModalContrasenia() {
    this.modalContrasenia = false;
    this.formContrasenia = { actual: '', nueva: '', confirmar: '' };
  }

  cambiarContrasenia() {
    if (!this.formContrasenia.actual ||
      !this.formContrasenia.nueva ||
      !this.formContrasenia.confirmar) {
      Swal.fire("Advertencia", "Todos los campos son obligatorios", "warning");
      return;
    }

    if (this.formContrasenia.nueva.length < 6) {
      Swal.fire("Advertencia", "La nueva contraseña debe tener al menos 6 caracteres", "warning");
      return;
    }

    if (this.formContrasenia.nueva !== this.formContrasenia.confirmar) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    const data = {
      actual: this.formContrasenia.actual,
      nueva: this.formContrasenia.nueva
    };

    this.PerfilService.cambiarContrasenia(data).subscribe({
      next: (response) => {
        Swal.fire("Éxito", "Contraseña cambiada con éxito", "success");
        this.cerrarModalContrasenia();
      },
      error: (err) => {
        const mensaje = err.error?.mensaje || "Error al cambiar contraseña";
        Swal.fire("Error", mensaje, "error");
      }
    });
  }
}
