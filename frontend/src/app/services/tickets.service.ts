import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private apiUrl = 'http://localhost:3000/api/tickets';

  constructor(private http: HttpClient ,private authService: AuthService) {}
  
  getTickets(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  obtenerMisTickets(): Observable<any> {
  return this.http.get(`${this.apiUrl}/mios`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  }
  getTecnicos() {
  const token = this.authService.obtenerToken();
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/tecnicos`, { headers });
  }
  asignarTicket(idTicket: number, dniTecnico: string, herramientas: string[]) {
    const token = this.authService.obtenerToken();
    const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
    return this.http.put(`${this.apiUrl}/asignar/${idTicket}`,
      { asignadoA: dniTecnico, herramientas },
      { headers }
    );
  }
  getTicket(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  obtenerCategorias(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

    return this.http.get<any[]>(`${this.apiUrl}/categorias`, { headers });
  }
  crearTicket(ticket: FormData): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.post(`${this.apiUrl}`, ticket, { headers });
}}
