# Sistema de Incidencias Móvil

Esta aplicación es una réplica móvil del frontend del Sistema de Incidencias, desarrollada en **React Native** con **Expo**.

## Características Implementadas

- **Autenticación JWT**: Login seguro conectado al backend existente.
- **Gestión de Sesión**: Persistencia de sesión (Token) usando SecureStore.
- **Listado de Tickets**: Visualización de tickets con filtros, búsqueda y pull-to-refresh.
- **Detalle de Ticket**: Vista completa de la información del ticket.
- **Creación de Tickets**: Formulario para crear nuevas incidencias.
- **Diseño**: Adaptación fiel del esquema de colores (#0a3a6b) y estilos del frontend web.

## Requisitos Previos

- Node.js instalado.
- Dispositivo Android/iOS o Emulador.
- Backend del Sistema de Incidencias corriendo (`http://localhost:3000`).

## Instalación

1. Navegar a la carpeta `appMobil`:
   ```bash
   cd appMobil
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```

## Configuración del Backend

La aplicación necesita saber dónde está tu backend.
Edita el archivo `src/api/client.ts`:

```typescript
// Si usas Emulador Android:
const BASE_URL = 'http://10.0.2.2:3000/api';

// Si usas Dispositivo Físico o Emulador iOS:
// Reemplaza con tu IP local (ej. 192.168.1.50)
const BASE_URL = 'http://192.168.1.X:3000/api';
```

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
npx expo start
```

### Opciones:
- Presiona `a` para abrir en Android Emulator.
- Presiona `w` para abrir en Web.
- Escanea el código QR con la app **Expo Go** en tu celular físico.

## Generación de APK (Android)

Para generar el archivo APK instalable:

1. Instalar EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Iniciar sesión en Expo (si no tienes cuenta, crea una en expo.dev):
   ```bash
   eas login
   ```
3. Configurar el proyecto:
   ```bash
   eas build:configure
   ```
4. Generar el build para Android:
   ```bash
   eas build -p android --profile preview
   ```
   Esto generará un APK que puedes descargar e instalar.

## Estructura del Proyecto

- `src/api`: Cliente HTTP (Axios) y configuración.
- `src/context`: Manejo de estado global (Auth).
- `src/screens`: Pantallas (Login, List, Detail, Create).
- `src/navigation`: Configuración de rutas.
- `src/types`: Definiciones de TypeScript.

## Notas Técnicas

- Se utiliza **Expo SecureStore** para almacenar el token JWT.
- Se utiliza **React Navigation** 6.x para la navegación nativa.
- El diseño es **Responsive** y utiliza SafeAreaView para compatibilidad con notch.
