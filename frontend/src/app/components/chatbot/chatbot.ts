import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FormatoHTMLPipe } from '../../formato-html-pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule,FormatoHTMLPipe],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class Chatbot {

  abierto = false;
  mensaje = '';
  mostrarBotonTicket = false;


  // Mensajes guardados solo en local
  mensajes: { emisor: 'user' | 'bot', texto: string }[] = [];

  loading = false;

  constructor(private http: HttpClient, private router:Router) {
    this.cargarHistorial();
  }

  // ---------------------------
  // 🔹 Abrir / cerrar chatbot
  // ---------------------------
  toggleChatbot() {
    this.abierto = !this.abierto;
  }

  // ---------------------------
  // 🔹 Fecha formateada
  // ---------------------------
  getFechaHoy(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${hoy.getMonth() + 1}-${hoy.getDate()}`;
  }

  // ---------------------------
  // 🔹 Control de preguntas por día
  // ---------------------------
  getPreguntasHoy(): number {
    const data = localStorage.getItem("chatbot_preguntas");
    if (!data) return 0;

    const registro = JSON.parse(data);

    // Si la fecha no coincide, se resetea
    if (registro.fecha !== this.getFechaHoy()) {
      return 0;
    }

    return registro.cantidad;
  }

  incrementarPreguntas() {
    const fecha = this.getFechaHoy();

    const nuevoRegistro = {
      fecha,
      cantidad: this.getPreguntasHoy() + 1
    };

    localStorage.setItem("chatbot_preguntas", JSON.stringify(nuevoRegistro));
  }

  // ---------------------------
  // 🔹 Guardar historial
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
  // 🔹 Enviar mensaje al servidor
  // ---------------------------
  enviarMensaje() {
    if (!this.mensaje.trim()) return;

    // 🔒 Validar límite diario
    if (this.getPreguntasHoy() >= 2) {
      this.mensajes.push({
        emisor: 'bot',
        texto: "😕 Ya hiciste las 2 preguntas permitidas hoy si el problema sigue habre un ticket al soporte tecnico."
      });
      this.mostrarBotonTicket = true;
      this.guardarHistorial();
      return;
    }

    const texto = this.mensaje;
    this.mensajes.push({ emisor: 'user', texto });
    this.mensaje = '';
    this.loading = true;

    // Registrar la pregunta
    this.incrementarPreguntas();

    this.http.post<any>("http://localhost:3000/api/estadisticas/chatbot", { mensaje: texto })
      .subscribe({
        next: (res) => {
          this.mensajes.push({ emisor: 'bot', texto: res.respuesta });
          this.loading = false;
          this.guardarHistorial();
        },
        error: () => {
          this.mensajes.push({ emisor: 'bot', texto: "Error al contactar al servidor 😥" });
          this.loading = false;
          this.guardarHistorial();
        }
      });
  }
  abrirTicket() {
 this.router.navigate(['/tickets/nuevo']);
}


}
