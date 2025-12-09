import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoHTML'
})
export class FormatoHTMLPipe implements PipeTransform {
   transform(texto: string): string {
    if (!texto) return '';

    return texto
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')   // **negrita**
      .replace(/\*(.*?)\*/g, '<i>$1</i>')      // *cursiva*
      .replace(/\n/g, '<br>');                 // Saltos de línea
  }
}
