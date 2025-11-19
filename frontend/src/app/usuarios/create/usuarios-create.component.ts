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
    idDepartamento:'',
    idGerencia:'',
    usuario: '',
    password: ''
  };

  loading = false;
  error = '';
  roles: any[] = [];
  cargos: any[] = [];
  oficinas: any[] = [];
  mostrarOficinas = false;
  mostrarRango = false;
  rangeUnidad = '';
  mostrarDepartamentos = false;
  mostrarGerencias = false;
  departamentos: any[] = [];
  gerencias: any[] = [];
  mostrarRangoUnidad = false;  // para asistente, secretario, técnico, personal


  constructor(private usuariosService: UsuariosService, private router: Router) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarCargos();
    this.cargarOficinas();
    this.cargarGerencias();
    this.cargarDepartamentos();
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
  cargarGerencias(){
    this.usuariosService.obtenerGerencias().subscribe({
      next: (data) => {
        this.gerencias = data;
      },
      error: (err) => {
        console.error('Error al cargar Oficinas:', err);
      }
    });
  }
  cargarDepartamentos(){
    this.usuariosService.obtenerDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
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
    this.usuario.password = this.usuario.dni; // Establecer contraseña inicial como DNI
    this.usuario.usuario = this.usuario.dni; // Establecer nombre de usuario como DNI
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
  onCargoChange() {
    const cargo = Number(this.usuario.idCargo);

    // Reiniciar visibilidad
    this.mostrarGerencias = false;
    this.mostrarDepartamentos = false;
    this.mostrarOficinas = false;
    this.mostrarRangoUnidad = false;


    if (cargo === 2) {  
      this.mostrarGerencias = true;          // solo gerencia
    }
    else if (cargo === 3) { 
      this.mostrarDepartamentos = true;      // solo departamentos
    }
    else if (cargo === 4) {  
      this.mostrarOficinas = true;           // solo oficinas
    }
    else if ([5, 6, 7, 8].includes(cargo)) {  
      this.mostrarRangoUnidad = true;
      // asistente / secretario / técnico / personal
    }
  }
  onRangoUnidadChange(rango: any) {
    rango = Number(rango);
  // Limpiar todo antes de asignar
  this.usuario.idGerencia = "";
  this.usuario.idDepartamento = "";
  this.usuario.idOficina = "";

  if (rango === 1) {
    this.mostrarGerencias = true;
    this.mostrarDepartamentos = false;
    this.mostrarOficinas = false;
  }

  else if (rango === 2) {
    this.mostrarGerencias = false;
    this.mostrarDepartamentos = true;
    this.mostrarOficinas = false;
  }

  else if (rango === 3) {
    this.mostrarGerencias = false;
    this.mostrarDepartamentos = false;
    this.mostrarOficinas = true;
  }
}

  soloNumeros(event: any) {
    event.target.value = event.target.value.replace(/\D/g, '');
  }
  
  cancelar() {
    this.router.navigate(['/usuarios']);
  }
}
