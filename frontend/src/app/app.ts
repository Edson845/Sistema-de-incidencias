import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-roots',
  imports: [RouterOutlet],
  templateUrl: 'app.html',
  styleUrl: 'app.css'
})
export class AppComponent {
  protected readonly title = signal('frontend');
}
