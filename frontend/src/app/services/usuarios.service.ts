import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) { }

  // Obtener lista de usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Obtener un usuario por ID o DNI
  getUsuario(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
  // Obtener técnicos
  getTecnicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tecnicos`);
  }

  // Crear usuario
  createUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, usuario).pipe(
      tap(res => console.log('Respuesta del servidor:', res)),
      catchError(err => {
        console.error('Error en petición:', err);
        return throwError(() => err);
      })
    );
  }

  // Registro público
  registerUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, usuario);
  }



  obtenerRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }


  // Eliminar usuario
  eliminarUsuario(dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dni}`);
  }

  // Obtener perfil del usuario logueado
  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  // Actualizar perfil
  actualizarPerfil(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, data);
  }

  // Actualizar avatar
  actualizarAvatar(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil/avatar`, formData);
  }
}
