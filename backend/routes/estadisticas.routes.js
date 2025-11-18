import express from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import { chatMunicipal } from '../controllers/chatbot.controller.js';
import { 
  getResumen, 
  getTicketsPorEstado, 
  getTicketsPorUsuario, 
  getUsuariosPorRol, 
  getEstadisticasGenerales 
} from '../controllers/estadisticas.controller.js';

const router = express.Router();

// Ruta principal solo para admin
router.get('/generales', verificarToken, verificarRol('admin'), getEstadisticasGenerales);
router.get('/', verificarToken, verificarRol('admin'), getEstadisticasGenerales);

// Rutas de estadísticas específicas (puedes aplicar roles según sea necesario)
router.get('/resumen', verificarToken, verificarRol('tecnico'), getResumen);
router.get('/tickets-por-estado', verificarToken, verificarRol('admin'), getTicketsPorEstado);
router.get('/tickets-por-usuario', verificarToken, verificarRol('usuario'), getTicketsPorUsuario);
router.get('/usuarios-por-rol', verificarToken, verificarRol('admin'), getUsuariosPorRol);
router.post('/chatbot', chatMunicipal);

export default router;
