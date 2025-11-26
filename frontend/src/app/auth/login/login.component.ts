import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  identificador = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  login(): void {
    if (!this.isFormValid()) return;

    this.startLoading();

    this.authService.login(this.identificador, this.password).subscribe({
      next: (response) => this.handleLoginSuccess(response),
      error: () => this.handleLoginError()
    });
  }
  private isFormValid(): boolean {
    if (!this.identificador || !this.password) {
      this.error = 'Por favor, completa todos los campos.';
      return false;
    }
    return true;
  }

  private startLoading(): void {
    this.error = '';
    this.isLoading = true;
  }

  private stopLoading(): void {
    this.isLoading = false;
  }

  private handleLoginSuccess(response: any): void {
    this.stopLoading();
    this.storeSession(response);
    this.redirectUserByRole(response.roles?.[0]);
  }

  private handleLoginError(): void {
    this.stopLoading();
    this.error = 'Credenciales inválidas o error en el servidor.';
  }

  private storeSession(response: any): void {
    if (response?.token) {
      localStorage.setItem('token', response.token);
    }

    const rol = response?.roles?.[0]?.toLowerCase();
    if (rol) {
      localStorage.setItem('rol', rol);
    }
  }

  private redirectUserByRole(rol: string = ''): void {
    const role = rol.toLowerCase();

    // Mapa limpio de roles y rutas
    const roleRoutes: Record<string, string> = {
      admin: '/dashboard',
      usuario: '/tickets',
      tecnico: '/dashboard'
    };

    const route = roleRoutes[role] || '/dashboard';
    this.router.navigate([route]);
  }
}
