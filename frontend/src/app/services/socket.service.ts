import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  constructor() {
    // ajustar URL si backend en otro puerto
    this.socket = io('http://localhost:3000');
  }

  on<T>(evento: string): Observable<T> {
    return new Observable<T>(subscriber => {
      const handler = (data: T) => subscriber.next(data);
      this.socket.on(evento, handler);
      return () => this.socket.off(evento, handler);
    });
  }

  emit(evento: string, payload?: any) {
    this.socket.emit(evento, payload);
  }
}