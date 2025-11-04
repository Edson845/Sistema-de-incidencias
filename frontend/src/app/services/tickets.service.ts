import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private apiUrl = 'http://localhost:3000/api/tickets';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
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
}

}
