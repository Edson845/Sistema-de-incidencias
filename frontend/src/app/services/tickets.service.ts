import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ObservacionTecnico } from '../tickets/observacion-tecnico/observacion-tecnico';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private apiUrl = 'http://localhost:3000/api/tickets';

  constructor(private http: HttpClient) { }

  // Obtener tickets del usuario
  obtenerMisTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mios`);
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
  ObservacionTicket(idTicket: number, data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/observacion/${idTicket}`, data);
  }
  agregarComentario(idTicket: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/comentarios/${idTicket}`, formData);
  }
  getHistorialCompleto(idTicket: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial/${idTicket}`);
  }

  marcarNoResuelto(idTicket: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idTicket}/no-resuelto`, datos);
  }
}
