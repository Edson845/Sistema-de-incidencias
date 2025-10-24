import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-edit.component.html',
  styleUrls: ['./usuarios-edit.component.css']
})
export class UsuariosEditComponent implements OnInit {
  usuario: any = {};
  mensaje = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.usuariosService.getUsuario(id).subscribe((data) => (this.usuario = data));
  }

  guardarCambios() {
    this.usuariosService.actualizarUsuario(this.usuario.id, this.usuario).subscribe({
      next: () => {
        this.mensaje = 'Usuario actualizado correctamente ✅';
        setTimeout(() => this.router.navigate(['/usuarios']), 1500);
      },
      error: () => (this.mensaje = 'Error al actualizar ❌')
    });
  }
}
