import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  actualizarUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
