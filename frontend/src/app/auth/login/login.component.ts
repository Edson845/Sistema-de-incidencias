import { Component } from '@angular/core';
import { Router} from '@angular/router';
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
  email = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    // Validaciones básicas
    if (!this.email || !this.password) {
      this.error = 'Por favor, completa todos los campos.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Guarda token o usuario si viene en la respuesta
        if (response?.token) {
          localStorage.setItem('token', response.token);
        }

        // Redirige al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.isLoading = false;
        this.error = 'Credenciales inválidas o error en el servidor.';
      }
    });
  }
}
