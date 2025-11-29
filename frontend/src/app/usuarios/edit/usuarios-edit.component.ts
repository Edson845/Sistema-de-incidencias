import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { CatalogoService } from '../../services/catalogos.service';
import { RolService } from '../../services/rol.service';

@Component({
  selector: 'app-usuarios-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-edit.component.html',
  styleUrls: ['./usuarios-edit.component.css']
})
export class UsuariosEditComponent implements OnInit {
  usuario: any = {
    dni: '',
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    idRol: '',
    idCargo: '',
    idOficina: '',
    idDepartamento: '',
    idGerencia: '',
    usuario: '',
    password: '' // Nuevo campo para resetear password
  };

  loading = false;
  mensaje = '';
  tipoMensaje = ''; // 'success' | 'error'

  // Listas auxiliares
  roles: any[] = [];
  cargos: any[] = [];
  oficinas: any[] = [];
  departamentos: any[] = [];
  gerencias: any[] = [];

  // Control de visibilidad
  mostrarOficinas = false;
  mostrarDepartamentos = false;
  mostrarGerencias = false;
  mostrarRangoUnidad = false;
  rangeUnidad = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService,
    private CatalogoService: CatalogoService,
    private RolService: RolService 
  ) { }

  ngOnInit() {
    this.cargarDatosAuxiliares();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarUsuario(id);
    }
  }

  cargarDatosAuxiliares() {
    this.RolService.obtenerRoles().subscribe(data => this.roles = data);
    this.CatalogoService.obtenerCargos().subscribe(data => this.cargos = data);
    this.CatalogoService.obtenerOficinas().subscribe(data => this.oficinas = data);
    this.CatalogoService.obtenerGerencias().subscribe(data => this.gerencias = data);
    this.CatalogoService.obtenerDepartamentos().subscribe(data => this.departamentos = data);
  }

  cargarUsuario(id: number) {
    this.loading = true;
    this.usuariosService.getUsuario(id).subscribe({
      next: (data) => {
        this.usuario = { ...data, password: '' }; // Password vacío por defecto
        // Ajustar lógica de visualización según el cargo cargado
        if (this.usuario.idCargo) {
          this.onCargoChange();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuario:', err);
        this.mostrarMensaje('Error al cargar los datos del usuario', 'error');
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
      this.mostrarGerencias = true;
    }
    else if (cargo === 3) {
      this.mostrarDepartamentos = true;
    }
    else if (cargo === 4) {
      this.mostrarOficinas = true;
    }
    else if ([5, 6, 7, 8].includes(cargo)) {
      this.mostrarRangoUnidad = true;
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

  guardarCambios() {
    this.loading = true;

    // Preparar objeto para enviar (eliminar password si está vacío para no sobreescribirlo)
    const datosActualizar = { ...this.usuario };
    if (!datosActualizar.password) {
      delete datosActualizar.password;
    }

    this.usuariosService.actualizarUsuario(this.usuario.dni, datosActualizar).subscribe({
      next: () => {
        this.mostrarMensaje('Usuario actualizado correctamente', 'success');
        setTimeout(() => this.router.navigate(['/usuarios']), 1500);
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        this.mostrarMensaje('Error al actualizar el usuario', 'error');
        this.loading = false;
      }
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 3000);
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }

  soloNumeros(event: any) {
    event.target.value = event.target.value.replace(/\D/g, '');
  }
}
