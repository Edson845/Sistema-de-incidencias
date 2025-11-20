import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private apiUrl = 'http://localhost:3000/api/usuarios'; // Ajusta tu URL según tu backend

  constructor(private http: HttpClient) {}
  // Cambiar contraseña
  cambiarContrasenia(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-contrasenia`, data);
  }
  getPerfil() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/perfil`, { headers });
  }

  actualizarPerfil(data: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/perfil`, data, { headers });
  }


  actualizarAvatar(dni: string, archivo: File) {
    const fd = new FormData();
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`});
    fd.append('avatar', archivo);
    return this.http.put(`${this.apiUrl}/usuario/avatar/${dni}`,fd,{headers});
  }
}
