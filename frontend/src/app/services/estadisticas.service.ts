import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = 'http://localhost:3000/api/estadisticas'; // tu endpoint backend

  constructor(private http: HttpClient) {}

  // Obtener resumen general
  getResumen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen`);
  }

  // Obtener cantidad de tickets por estado
  getTicketsPorEstado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tickets-por-estado`);
  }

  // Obtener cantidad de tickets por usuario
  getTicketsPorUsuario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tickets-por-usuario`);
  }

  // Obtener cantidad de usuarios por rol (admin, usuario)
  getUsuariosPorRol(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios-por-rol`);
  }

  // Obtener estadísticas generales del sistema
  getEstadisticasGenerales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/generales`);
  }
}
