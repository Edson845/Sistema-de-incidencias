import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './usuarios-create.component.html',
  styleUrls: ['./usuarios-create.component.css']
})
export class UsuariosCreateComponent implements OnInit {
  usuario = {
    dni: '',
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    idRol: '',
    idCargo:'',
    idOficina:'',
    usuario: '',
    password: ''
  };

  loading = false;
  error = '';
  roles: any[] = [];
  cargos: any[] = [];
  oficinas: any[] = [];

  constructor(private usuariosService: UsuariosService, private router: Router) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarCargos();
    this.cargarOficinas();
  }
  
  cargarCargos(){
    this.usuariosService.obtenerCargos().subscribe({
      next: (data) => {
        this.cargos = data;
      },
      error: (err) => {
        console.error('Error al cargar Cargos:', err);
      }
    });
  }
  cargarRoles() {
    this.usuariosService.obtenerRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
      }
    });
  }
  cargarOficinas(){
    this.usuariosService.obtenerOficinas().subscribe({
      next: (data) => {
        this.oficinas = data;
      },
      error: (err) => {
        console.error('Error al cargar Oficinas:', err);
      }
    });
  }

  crearUsuario() {
    console.log('Iniciando creación de usuario...', this.usuario);
    this.loading = true;
    this.error = '';

    if (!this.usuario.dni || !this.usuario.nombres || !this.usuario.apellidos || 
        !this.usuario.correo || !this.usuario.usuario || !this.usuario.password || !this.usuario.idRol) {
      console.error('Faltan campos requeridos:', this.usuario);
      this.error = 'Por favor complete todos los campos requeridos';
      this.loading = false;
      return;
    }

    // Usar el endpoint de creación de usuarios que maneja roles
    this.usuariosService.createUsuario(this.usuario).subscribe({
      next: (response) => {
        console.log('Usuario creado exitosamente:', response);
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.error = err.error?.mensaje || 'Error al crear el usuario';
        this.loading = false;
      },
      complete: () => {
        console.log('Operación de creación completada');
        this.loading = false;
      }
    });
  }
  soloNumeros(event: any) {
    event.target.value = event.target.value.replace(/\D/g, '');
  }
  
  cancelar() {
    this.router.navigate(['/usuarios']);
  }
}
