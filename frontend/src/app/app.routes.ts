import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { TicketsComponent } from './dashboard/tickets/tickets.component';
import { TicketsListComponent } from './tickets/list/tickets-list.component';
import { TicketsDetailsComponent } from './tickets/details/tickets-details.component';
import { TicketsCreateComponent } from './tickets/create/tickets-create.component';
import { UsuariosListComponent } from './usuarios/list/usuarios-list.component';
import { UsuariosDetailComponent } from './usuarios/detail/usuarios-detail.component';
import { UsuariosEditComponent } from './usuarios/edit/usuarios-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: TicketsComponent },
  { path: 'tickets', component: TicketsListComponent },
  { path: 'tickets/:id', component: TicketsDetailsComponent },
  { path: 'tickets-create', component: TicketsCreateComponent },
  { path: 'usuarios', component: UsuariosListComponent },
  { path: 'usuarios/:id', component: UsuariosDetailComponent },
  { path: 'usuarios-edit/:id', component: UsuariosEditComponent }
];
