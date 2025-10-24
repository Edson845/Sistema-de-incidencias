import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './layout/layout.component';

// Vistas del sistema
import { TicketsComponent } from './dashboard/tickets/tickets.component';
import { TicketsListComponent } from './tickets/list/tickets-list.component';
import { TicketsCreateComponent } from './tickets/create/tickets-create.component';
import { TicketsDetailsComponent } from './tickets/details/tickets-details.component';
import { UsuariosListComponent } from './usuarios/list/usuarios-list.component';
import { UsuariosDetailComponent } from './usuarios/detail/usuarios-detail.component';
import { UsuariosEditComponent } from './usuarios/edit/usuarios-edit.component';
// import { EstadisticasComponent } from './estadisticas/estadisticas.component';

export const routes: Routes = [
  // 🔹 Página inicial
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // ✅ sin "/"

  // 🔹 Login (sin sidebar)
  { path: 'login', component: LoginComponent },

  // 🔹 Layout principal (con sidebar)
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: TicketsComponent },

      // Tickets
      { path: 'tickets', component: TicketsListComponent },
      { path: 'tickets/nuevo', component: TicketsCreateComponent },
      { path: 'tickets/:id', component: TicketsDetailsComponent },

      // Usuarios
      { path: 'usuarios', component: UsuariosListComponent },
      { path: 'usuarios/:id', component: UsuariosDetailComponent },
      { path: 'usuarios/editar/:id', component: UsuariosEditComponent },

      // Estadísticas
      // { path: 'estadisticas', component: EstadisticasComponent },

      // Redirección por defecto dentro del layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 🔹 Cualquier otra ruta → login
  { path: '**', redirectTo: 'login' } // ✅ sin "/"
];
