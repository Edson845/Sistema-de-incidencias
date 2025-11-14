import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

import { TicketsComponent } from './dashboard/tickets/tickets.component';
import { TicketsListComponent } from './tickets/list/tickets-list.component';
import { TicketsCreateComponent } from './tickets/create/tickets-create.component';
import { TicketsDetailsComponent } from './tickets/details/tickets-details.component';

import { UsuariosListComponent } from './usuarios/list/usuarios-list.component';
import { UsuariosDetailComponent } from './usuarios/detail/usuarios-detail.component';
import { UsuariosEditComponent } from './usuarios/edit/usuarios-edit.component';
import { UsuariosCreateComponent } from './usuarios/create/usuarios-create.component';
import { Perfil } from './perfil/perfil';

import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: TicketsComponent },

      { path: 'tickets', component: TicketsListComponent },
      { path: 'tickets/nuevo', component: TicketsCreateComponent },
      { path: 'tickets/:id', component: TicketsDetailsComponent },

      { path: 'usuarios', component: UsuariosListComponent },
      { path: 'usuarios/nuevo', component: UsuariosCreateComponent },
      { path: 'usuarios/editar/:id', component: UsuariosEditComponent },
      { path: 'usuarios/:id', component: UsuariosDetailComponent },
      { path: 'usuario/perfil', component: Perfil },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', component: NotFound }
];
