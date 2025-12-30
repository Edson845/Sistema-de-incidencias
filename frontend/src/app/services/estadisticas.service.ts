import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl =`${environment.ApiUrl}/estadisticas`; // tu endpoint backend

  constructor(private http: HttpClient) { }

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
  return this.http.get(`${this.apiUrl}/generales`,
  );
}

  // Obtener eficiencia de técnicos (tickets resueltos por técnico)
  getEficienciaTecnicos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/eficiencia-tecnicos`);
  }
}
