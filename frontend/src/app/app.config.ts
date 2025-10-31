import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const token = localStorage.getItem('token');
          if (token) {
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Token agregado al header desde app.config.ts');
            return next(cloned);
          }
          console.warn('⚠️ No se encontró token');
          return next(req);
        }
      ])
    ),
  ],
};
