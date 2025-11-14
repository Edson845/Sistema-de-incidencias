import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {

  usuario: any = {};
  editNombreUsuario = '';
  nuevaPassword = '';
  confirmPassword = '';
  mensaje = '';
  loading = false;

  fileAvatar: File | null = null;
  avatarPreview: string | ArrayBuffer | null = null;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    const datos = this.authService.obtenerDatosUsuario; // <— YA NO ES UNA FUNCIÓN

    if (datos) {
      this.usuario = datos;

      // Si tu modelo NO tiene “usuario”
      // usamos "nombre" como nombre editable
      this.editNombreUsuario = datos.nombre || '';
    }
  }

  seleccionarAvatar(event: any): void {
    const file = event.target.files?.[0] || null;

    if (file) {
      this.fileAvatar = file;
      const reader = new FileReader();
      reader.onload = () => (this.avatarPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  guardarCambios(): void {
    if (this.nuevaPassword && this.nuevaPassword !== this.confirmPassword) {
      this.mensaje = '⚠️ Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.mensaje = '✅ Cambios guardados correctamente.';
    }, 1200);
  }
}
