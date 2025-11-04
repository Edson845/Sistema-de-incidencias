import express from 'express';
import multer from 'multer';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import { 
  getTicketsUsuario, 
  obtenerCategorias,
  getTodosTickets, 
  crearTicket, 
  actualizarTicket 
} from '../controllers/tickets.controller.js';

const router = express.Router();
const upload = multer(); // memoria, sin guardar archivos

router.get('/mios', verificarToken, verificarRol('usuario', 'tecnico', 'admin'), getTicketsUsuario);
router.get('/', verificarToken, verificarRol('admin', 'tecnico'), getTodosTickets);
router.get('/categorias', verificarToken, obtenerCategorias);
router.post('/',verificarToken,verificarRol(['usuario']),upload.none(),crearTicket);
//router.post('/', verificarToken, verificarRol('usuario', 'admin'), crearTicket);
router.put('/:id', verificarToken, verificarRol('tecnico', 'admin'), actualizarTicket);

export default router;
