import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class RolService {
  private apiUrl = 'http://localhost:3000/api/roles';

  constructor(private http: HttpClient) {}
// Obtener listados auxiliares
  obtenerRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }
}