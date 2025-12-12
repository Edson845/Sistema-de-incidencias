import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import http from 'http';
import { initSocket } from './socket.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';
import catalogosRoutes from './routes/catalogos.routes.js';
import { verificarToken } from './middlewares/auth.middleware.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import rolesRoutes from './routes/rol.routes.js';
dotenv.config();

const app = express();
const upload = multer();
const server = http.createServer(app);
const io = initSocket(server);
app.use(cors({
  origin: [
    'http://localhost:4200',     // Angular
    'exp://*',                   // Expo Go
    'http://192.168.1.*',        // Teléfonos en la red
    'http://192.168.0.*'
  ],
  // Permite tu app Angular
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600
}));
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://localhost:4200",
          "http://192.168.0.0/16"   // permite toda la red local
        ],
        imgSrc: ["'self'", "data:", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/tickets', express.static(path.resolve('uploads/tickets')));
app.use('/api/auth', authRoutes);
app.use('/api/tickets', verificarToken, ticketsRoutes);
app.use('/api/usuarios', verificarToken, usuariosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/catalogos', verificarToken, catalogosRoutes);
app.use('/api/roles', verificarToken, rolesRoutes);


const PORT = process.env.PORT || 3000;
// Arrancar solo el servidor HTTP (evita llamar a app.listen y server.listen al mismo puerto)
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

// Manejar errores del servidor (p. ej. EADDRINUSE)
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Error: Puerto ${PORT} ya está en uso. Asegúrate de que no haya otra instancia corriendo o cambia el PORT.`);
    process.exit(1);
  } else {
    console.error('Error del servidor:', err);
    process.exit(1);
  }
});
