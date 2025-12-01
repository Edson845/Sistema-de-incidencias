import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-calificar-ticket',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './calificar-ticket.html',
  styleUrl: './calificar-ticket.css'
})
export class CalificarTicket {

  rol: string = '';
  calificacion: number = 0;
  comentario: string = '';
  observacionTecnico: string = '';


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CalificarTicket>
  ) {this.rol = (data?.rol ?? '').toLowerCase(); }

  ngOnInit() {
    //this.rol = (this.data?.rol ?? '').toLowerCase();  // <--- evita null
    console.log("ROL RECIBIDO EN MODAL:", this.rol);
  }
  adjunto: File[] = [];
  onFileSelected(event: any) {
    this.adjunto = Array.from(event.target.files);
    console.log("📎 Archivos seleccionados por técnico:", this.adjunto);
  }
  guardar() {
    let payload: any = {rol : this.rol};

    if (this.rol === 'usuario') {
      payload = {
        rol: this.rol,
        calificacion: this.calificacion,
        comentario: this.comentario
      };
    }

    if (this.rol === 'tecnico') {
      payload = {
        rol: this.rol,
        observacionTecnico: this.observacionTecnico,
        adjunto: this.adjunto
      };
    }

    this.dialogRef.close(payload);
  }

  cerrar() {
    this.dialogRef.close();
  }

  setCalificacion(valor: number) {
    this.calificacion = valor;
  }

  getSubtitle(): string {
    if (this.rol === 'usuario') return 'Tu opinión nos ayuda a mejorar';
    if (this.rol === 'tecnico') return 'Registra las observaciones del trabajo realizado';
    if (this.rol === 'admin') return 'Visualización de la evaluación completa';
    return '';
  }

  getMensajeCalificacion(): string {
    const mensajes: { [key: number]: string } = {
      5: '¡Excelente! Nos alegra que hayas tenido una gran experiencia',
      4: '¡Muy bien! Gracias por tu valoración positiva',
      3: 'Gracias por tu opinión, trabajaremos para mejorar',
      2: 'Lamentamos que no haya sido satisfactorio, tomaremos nota',
      1: 'Lo sentimos mucho, revisaremos lo ocurrido para mejorar'
    };
    return mensajes[this.calificacion] || '';
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

}
