import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000"],
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
