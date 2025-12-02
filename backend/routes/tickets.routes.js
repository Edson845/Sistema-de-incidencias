import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// --- CONFIGURACIÓN MULTER ---
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ok = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (ok) return cb(null, true);
    cb(new Error('Solo se permiten archivos .jpg, .jpeg, .png o .pdf'));
  }
});

// ----------------------------------------------------------
// 🔵 RUTAS ESPECÍFICAS (DEBEN IR PRIMERO)
// ----------------------------------------------------------
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
