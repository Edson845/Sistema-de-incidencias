import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private apiUrl = 'http://localhost:3000/api/catalogos';

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