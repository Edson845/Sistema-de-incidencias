import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string, rol: string }>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  }

  get token() {
    return localStorage.getItem('token');
  }

  get rol() {
    return localStorage.getItem('rol');
  }

  isLoggedIn() {
    return !!this.token;
  }
}
