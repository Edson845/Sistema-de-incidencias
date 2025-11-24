import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private apiUrl = 'http://localhost:3000/api/tickets';

  constructor(private http: HttpClient) { }

  // Obtener tickets del usuario
  obtenerMisTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mios`);
  }

  // Obtener técnicos
  getTecnicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/tecnicos`);
  }

  // Asignar ticket
  asignarTicket(idTicket: number, dniTecnico: string, herramientas: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/asignar/${idTicket}`, {
      asignadoA: dniTecnico,
      herramientas
    });
  }

  // Obtener un ticket por ID
  getTicket(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Categorías
  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`);
  }

  // Crear ticket
  crearTicket(ticket: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, ticket);
  }

  // Obtener herramientas de un ticket
  getHerramientasByTicket(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/herramientas/${id}`);
  }

  // Actualizar estado del ticket
  actualizarEstado(idTicket: number, nuevoEstado: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idTicket}`, {
      estado: nuevoEstado
    });
  }

  // Detalle de tickets
  obtenerTicketsDetallado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/detallado`);
  }

  // Enviar WhatsApp
  enviarWhatsApp(numero: string, mensaje: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp`, {
      numero,
      mensaje
    });
  }

  // Calificar Ticket
  calificarTicket(idTicket: number, data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/calificar/${idTicket}`, data);
  }

  // Obtener historial del ticket
  getHistorialTicket(idTicket: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial/${idTicket}`);
  }
}
