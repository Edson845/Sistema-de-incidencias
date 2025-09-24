import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarios() {
    return this.http.get(this.apiUrl);
  }

  getUsuario(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearUsuario(usuario: any) {
    return this.http.post(this.apiUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: any) {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }
}
