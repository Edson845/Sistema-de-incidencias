import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-observacion-tecnico',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButton, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './observacion-tecnico.html',
  styleUrl: './observacion-tecnico.css',
})
export class ObservacionTecnico {
  mostrarObservacion: boolean = false;
  observacion: string = "";
  archivoSeleccionado: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<ObservacionTecnico>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  guardar() {
    this.dialogRef.close({
      observacion: this.observacion || "Sin observación",
      archivo: this.archivoSeleccionado
    });
  }
}
