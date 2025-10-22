import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  nombreUsuario: string = '';
  rol: string = '';
  isClosed = false;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
  const usuario = this.authService.obtenerDatosUsuario as {
    nombre?: string;
    rol?: string | string[] | { nombre: string };
  } | null;

  if (usuario) {
    this.nombreUsuario = usuario.nombre || 'Usuario';

    if (typeof usuario.rol === 'string') {
      this.rol = usuario.rol.toLowerCase();
    } else if (Array.isArray(usuario.rol)) {
      this.rol = (usuario.rol[0]?.toString().toLowerCase()) || 'usuario';
    } else if (usuario.rol && typeof usuario.rol === 'object' && 'nombre' in usuario.rol) {
      this.rol = (usuario.rol.nombre.toString().toLowerCase());
    } else {
      this.rol = 'usuario';
    }
  } else {
    this.nombreUsuario = 'Invitado';
    this.rol = 'usuario';
  }
}


  toggleSidebar() {
    this.isClosed = !this.isClosed;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
