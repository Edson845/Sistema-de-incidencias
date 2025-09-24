import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private apiUrl = 'http://localhost:3000/api/tickets';

  constructor(private http: HttpClient) {}

  getTodosTickets(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getTicket(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearTicket(ticket: any): Observable<any> {
    return this.http.post(this.apiUrl, ticket);
  }

  actualizarTicket(id: number, ticket: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, ticket);
  }

  eliminarTicket(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
