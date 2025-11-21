import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { TokenInterceptor } from './app/interceptors/auth.interceptor';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent,appConfig 
).catch((err) => console.error(err));
