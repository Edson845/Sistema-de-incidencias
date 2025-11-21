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

  

}
