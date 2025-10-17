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

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    const usuario = this.authService.obtenerDatosUsuario;
    if (usuario) {
      this.nombreUsuario = usuario.nombre || 'Usuario';
      this.rol = usuario.rol?.toLowerCase() || 'usuario';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
