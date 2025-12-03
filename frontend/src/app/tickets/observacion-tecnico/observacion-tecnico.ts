import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-observacion-tecnico',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButton, FormsModule],
  templateUrl: './observacion-tecnico.html',
  styleUrl: './observacion-tecnico.css',
})
export class ObservacionTecnico {
  mostrarObservacion: boolean = false;
   observacion: string = "";

  constructor(
    public dialogRef: MatDialogRef<ObservacionTecnico>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  guardar() {
    this.dialogRef.close({
      observacion: this.observacion || "Sin observación"
    });
  }
}
