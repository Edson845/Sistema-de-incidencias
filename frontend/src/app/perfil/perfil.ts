import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    avatarUrl: '',
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

  constructor(private usuariosService: UsuariosService, private PerfilService: PerfilService) { }

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.PerfilService.getPerfil().subscribe(data => {
      this.perfil = data;
    });
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
      alert("Todos los campos son obligatorios");
      return;
    }

    if (this.formContrasenia.nueva !== this.formContrasenia.confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const data = {
      actual: this.formContrasenia.actual,
      nueva: this.formContrasenia.nueva
    };

    this.PerfilService.cambiarContrasenia(data).subscribe({
      next: (response) => {
        alert("Contraseña cambiada con éxito");
        this.cerrarModalContrasenia();
      },
      error: (err) => {
        alert("Error al cambiar contraseña");
      }
    });
  }
}
