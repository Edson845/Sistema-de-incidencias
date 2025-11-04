import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {

  private apiUrl = 'https://comprehend-it.p.rapidapi.com/predictions/ml-zero-nli-model';
  private headers = new HttpHeaders({
    'content-type': 'application/json',
    'x-rapidapi-key': 'mi_clave_super_segura_123',
    'x-rapidapi-host': 'comprehend-it.p.rapidapi.com'
  });

  constructor(private http: HttpClient) {}

  clasificarImportancia(descripcion: string): Observable<any> {
    const body = {
      text: descripcion,
      labels: ['Crítica', 'Alta', 'Media', 'Baja']
    };

    return this.http.post(this.apiUrl, body, { headers: this.headers });
  }
}
