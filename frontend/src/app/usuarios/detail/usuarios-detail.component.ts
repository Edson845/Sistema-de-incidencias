import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-detail.component.html',
  styleUrls: ['./usuarios-detail.component.css']
})
export class UsuariosDetailComponent implements OnInit {
  usuario: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.usuariosService.getUsuario(id).subscribe({
      next: (data) => {
        this.usuario = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  volver() {
    this.router.navigate(['/usuarios']);
  }
}
