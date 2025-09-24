import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-list.component.html'
})
export class UsuariosListComponent implements OnInit {
  usuarios: any[] = [];

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.usuariosService.getUsuarios().subscribe((data: any) => this.usuarios = data);
  }
}
