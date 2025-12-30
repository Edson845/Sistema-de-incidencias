import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private apiUrl = `${environment.ApiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // Cambiar contraseña
  cambiarContrasenia(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-contrasenia`, data);
  }

  // Obtener datos del perfil
  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  // Actualizar perfil
  actualizarPerfil(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, data);
  }

  // Actualizar avatar
  actualizarAvatar(dni: string, archivo: File): Observable<any> {
    const fd = new FormData();
    fd.append('avatar', archivo);

    return this.http.put(`${this.apiUrl}/usuario/avatar/${dni}`, fd);
  }
}
