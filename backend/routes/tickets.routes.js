import express from 'express';
import { upload } from '../middlewares/uploads.config.js'; 
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';

import {
  getTicketsUsuario,
  obtenerCategorias,
  getTodosTickets,
  crearTicket,
  actualizarEstado,
  getTicketsPorEstado,
  getTicketsPorMes,
  getEstadisticasGenerales,
  asignarTicketConHerramientas,
  getTicketPorId,
  obtenerTicketsDetallado,
  calificarTicket,
  obtenerHistorial,
  obtenerHerramientasTicket,
  agregarComentario,
  agregarObservacionTecnico
} from '../controllers/tickets.controller.js';

const router = express.Router();

router.get('/mios', verificarToken, verificarRol(['usuario', 'tecnico', 'admin']), getTicketsUsuario);
router.get('/categorias', verificarToken, obtenerCategorias);
router.get('/detallado', verificarToken, obtenerTicketsDetallado);

router.post('/calificar/:idTicket', verificarToken, upload.array('fotos', 5), calificarTicket);
router.post('/observacion/:idTicket', verificarToken, verificarRol(['tecnico', 'admin']), upload.single('adjunto'), agregarObservacionTecnico);

router.get('/herramientas/:id', verificarToken, verificarRol(['tecnico', 'admin']), obtenerHerramientasTicket);
router.post('/comentarios/:idTicket', verificarToken, verificarRol(['usuario', 'tecnico', 'admin']), upload.single('adjunto'), agregarComentario);

router.get('/estadisticas/por-estado', verificarToken, getTicketsPorEstado);
router.get('/estadisticas/por-mes', verificarToken, getTicketsPorMes);
router.get('/estadisticas/generales', verificarToken, getEstadisticasGenerales);

router.put('/asignar/:id', verificarToken, verificarRol(['admin']), asignarTicketConHerramientas);
router.get('/historial/:id', verificarToken, verificarRol(['usuario', 'tecnico', 'admin']), obtenerHistorial);

// ----------------------------------------------------------
// 🟢 RUTAS PRINCIPALES (DEBEN IR ANTES DE LAS DINÁMICAS)
// ----------------------------------------------------------
router.get('/', verificarToken, verificarRol(['admin', 'tecnico']), getTodosTickets);
router.post('/', verificarToken, verificarRol(['usuario', 'tecnico', 'admin']), upload.array('archivos', 5), crearTicket);

// ----------------------------------------------------------
// 🔴 RUTAS DINÁMICAS GENERALES (SIEMPRE AL FINAL)
// ----------------------------------------------------------
router.put('/:id', verificarToken, verificarRol(['tecnico', 'admin']), actualizarEstado);
router.get('/:id', verificarToken, verificarRol(['usuario', 'tecnico', 'admin']), getTicketPorId);

export default router;
