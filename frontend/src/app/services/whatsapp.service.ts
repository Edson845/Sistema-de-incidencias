import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private apiUrl = 'http://localhost:3000/api/whatsapp';
  constructor(private http: HttpClient) {}
    enviarWhatsApp(numero: string, mensaje: string) {
        return this.http.post<any[]>(`${this.apiUrl}/`, { numero, mensaje });
    }
}