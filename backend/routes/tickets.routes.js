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
  actualizarTicket
} from '../controllers/tickets.controller.js';

const router = express.Router();

// 🔹 Asegurar que la carpeta uploads exista
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 🔹 Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // nombre único (timestamp + nombre original)
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // máx 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Solo se permiten archivos .jpg, .jpeg, .png o .pdf'));
  }
});
router.get('/mios', verificarToken, verificarRol('usuario', 'tecnico', 'admin'), getTicketsUsuario);
router.get('/', verificarToken, verificarRol('admin', 'tecnico'), getTodosTickets);
router.get('/categorias', verificarToken, obtenerCategorias);
router.post('/',verificarToken,verificarRol(['usuario']),upload.array('archivos', 5),crearTicket);

router.put('/:id', verificarToken, verificarRol('tecnico', 'admin'), actualizarTicket);

export default router;
