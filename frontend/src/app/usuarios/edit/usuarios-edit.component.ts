import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-edit.component.html'
})
export class UsuariosEditComponent implements OnInit {
  usuario: any = { nombre: '', email: '', rol: 'usuario' };

  constructor(private route: ActivatedRoute, private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.usuariosService.getUsuario(id).subscribe(data => this.usuario = data);
  }

  guardarCambios() {
    this.usuariosService.actualizarUsuario(this.usuario.id, this.usuario)
      .subscribe(() => alert('Usuario actualizado correctamente'));
  }
}
