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
  ) {}

  ngOnInit() {
    this.rol = (this.data?.rol ?? '').toLowerCase();  // <--- evita null
    console.log("ROL RECIBIDO EN MODAL:", this.rol);
  }

  guardar() {
    let payload: any = {};

    if (this.rol === 'usuario') {
      payload = {
        calificacion: this.calificacion,
        comentario: this.comentario
      };
    }

    if (this.rol === 'tecnico') {
      payload = {
        observacionTecnico: this.observacionTecnico
      };
    }

    this.dialogRef.close(payload);
  }

  cerrar() {
    this.dialogRef.close();
  }
}
