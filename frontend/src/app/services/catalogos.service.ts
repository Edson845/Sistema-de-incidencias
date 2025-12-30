import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment.prod';
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private apiUrl = `${environment.ApiUrl}/catalogos`;

  constructor(private http: HttpClient) {}
// Obtener listados auxiliares
  obtenerOficinas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/oficinas`);
  }

  obtenerDepartamentos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/departamentos`);
  }
  obtenerCargos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cargos`);
  }
  obtenerGerencias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gerencias`);
  }
}