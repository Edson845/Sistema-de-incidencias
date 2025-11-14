import { Component } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { Chatbot } from '../components/chatbot/chatbot';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet, Chatbot],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {}
