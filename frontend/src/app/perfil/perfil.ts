import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { PerfilService } from '../services/perfil.service';
import { UsuariosService } from '../services/usuarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  avatarUrl: ''
};
  modalContrasenia = false;

  formContrasenia = {
    actual: '',
    nueva: '',
    confirmar: ''
  };
  editMode: boolean = false;
  avatarFile!: File;

  constructor(private usuariosService: UsuariosService, private PerfilService: PerfilService) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.PerfilService.getPerfil().subscribe(data => {
      this.perfil = data;
    });
  }
  previewUrl: string | null = null; // Vista previa temporal
  selectedFile: File | null = null;
  
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
  this.previewUrl = null; // Quita vista previa
  this.selectedFile = null;
  this.cargarPerfil();  // Recarga datos originales
}


  actualizarPerfil() {
    const data = {
      usuario: this.perfil.usuario,
      celular: this.perfil.celular,
      correo: this.perfil.correo,
      nombres: this.perfil.nombres,
      apellidos: this.perfil.apellidos
    };

    this.PerfilService.actualizarPerfil(data).subscribe(() => {
      Swal.fire("Éxito", "Perfil actualizado", "success");
      this.editMode = false;
      this.cargarPerfil();

      // Si el usuario cambió avatar
      if (this.avatarFile) {
        this.PerfilService.actualizarAvatar(this.perfil.dni, this.avatarFile)
          .subscribe(() => {
            Swal.fire("Avatar actualizado", "", "success");
            this.cargarPerfil();
          });
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

  // Aquí haces el llamado al backend
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
