import express from 'express';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';
import { 
  getResumen, 
  getTicketsPorEstado, 
  getTicketsPorUsuario, 
  getUsuariosPorRol, 
  getEstadisticasGenerales 
} from '../controllers/estadisticas.controller.js';

const router = express.Router();

// Ruta principal solo para admin
router.get('/', verificarToken, esAdmin, getEstadisticasGenerales);

// Rutas de estadísticas específicas
router.get('/resumen', getResumen);
router.get('/tickets-por-estado', getTicketsPorEstado);
router.get('/tickets-por-usuario', getTicketsPorUsuario);
router.get('/usuarios-por-rol', getUsuariosPorRol);
router.get('/generales', getEstadisticasGenerales);

export default router;
