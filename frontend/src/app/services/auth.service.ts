import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  // 🔹 Inicia sesión y devuelve el token
  login(correo: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { correo, password });
  }

  // 🔹 Guarda token en localStorage
  guardarToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // 🔹 Obtiene token del localStorage
  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 🔹 Elimina token
  eliminarToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // 🔹 Devuelve información básica del usuario
  get obtenerDatosUsuario(): { nombre: string; rol: string } | null {
    const token = this.obtenerToken(); // ✅ se llama como función
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return {
        nombre: decoded.nombre || decoded.email || 'Usuario',
        rol: decoded.rol || 'Empleado'
      };
    } catch {
      return null;
    }
  }

  // 🔹 Devuelve lista de roles (si existen múltiples)
  get roles(): string[] {
    const token = this.obtenerToken(); // ✅ corregido
    if (!token) return [];

    try {
      const decoded: any = jwtDecode(token);
      return decoded.roles || [decoded.rol || decoded.role].filter(Boolean);
    } catch {
      return [];
    }
  }

  // 🔹 Comprueba si el usuario está autenticado
  isLoggedIn(): boolean {
    return !!this.obtenerToken();
  }

  // 🔹 Verifica si el usuario tiene un rol específico
  tieneRol(rolBuscado: string): boolean {
    const datos = this.obtenerDatosUsuario; // ✅ sin paréntesis
    return !!datos && datos.rol.toLowerCase() === rolBuscado.toLowerCase();
  }

  // 🔹 Cierra sesión
  logout(): void {
    this.eliminarToken();
  }
}
