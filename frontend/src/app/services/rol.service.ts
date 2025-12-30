import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment.prod';
@Injectable({ providedIn: 'root' })
export class RolService {
  private apiUrl = `${environment.ApiUrl}/roles`;

  constructor(private http: HttpClient) {}
// Obtener listados auxiliares
  obtenerRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }
}