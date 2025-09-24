import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-detail.component.html'
})
export class UsuariosDetailComponent implements OnInit {
  usuario: any;

  constructor(private route: ActivatedRoute, private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.usuariosService.getUsuario(id).subscribe(data => this.usuario = data);
  }
}
