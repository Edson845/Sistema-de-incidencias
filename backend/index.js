import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import http from 'http';
import { initSocket } from './socket.js';

import authRoutes from './routes/auth.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';
import { verificarToken } from './middlewares/auth.middleware.js';

dotenv.config();

const app = express();
const upload = multer();
const server = http.createServer(app);
const io = initSocket(server);
app.use(cors({
  origin: 'http://localhost:4200', // Permite tu app Angular
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
        defaultSrc: ["'self'", "http://localhost:3000", "http://localhost:4200"],
        connectSrc: ["'self'", "http://localhost:3000", "http://localhost:4200"],
        imgSrc: ["'self'", "data:", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/tickets', verificarToken,ticketsRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);


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
