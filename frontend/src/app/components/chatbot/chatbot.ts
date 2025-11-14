import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class Chatbot {

  abierto = false;
  mensaje = '';

  // Mensajes guardados solo en local
  mensajes: { emisor: 'user' | 'bot', texto: string }[] = [];

  loading = false;

  constructor(private http: HttpClient) {
    this.cargarHistorial();
  }

  toggleChatbot() {
    this.abierto = !this.abierto;
  }

  // ---------------------------
  // 🔹 Guardar/leer historial desde localStorage
  // ---------------------------
  guardarHistorial() {
    localStorage.setItem("chatbot_historial", JSON.stringify(this.mensajes));
  }

  cargarHistorial() {
    const data = localStorage.getItem("chatbot_historial");
    if (data) {
      this.mensajes = JSON.parse(data);
    }
  }

  limpiarHistorial() {
    this.mensajes = [];
    localStorage.removeItem("chatbot_historial");
  }

  // ---------------------------
  // 🔹 Enviar mensaje al modelo DeepSeek
  // ---------------------------
  enviarMensaje() {
  if (!this.mensaje.trim()) return;

  const texto = this.mensaje;
  this.mensajes.push({ emisor: 'user', texto });
  this.mensaje = '';
  this.loading = true;

  this.http.post<any>("http://localhost:3000/api/estadisticas/chatbot", { mensaje: texto })
    .subscribe({
      next: (res) => {
        this.mensajes.push({ emisor: 'bot', texto: res.respuesta });
        this.loading = false;
      },
      error: () => {
        this.mensajes.push({ emisor: 'bot', texto: "Error al contactar al servidor 😥" });
        this.loading = false;
      }
    });
}

}
