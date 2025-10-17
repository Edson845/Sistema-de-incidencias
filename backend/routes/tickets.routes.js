import express from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import { 
  getTicketsUsuario, 
  getTodosTickets, 
  crearTicket, 
  actualizarTicket 
} from '../controllers/tickets.controller.js';

const router = express.Router();

router.get('/mios', verificarToken, verificarRol('usuario', 'tecnico', 'admin'), getTicketsUsuario);
router.get('/', verificarToken, verificarRol('admin', 'tecnico'), getTodosTickets);
router.post('/', verificarToken, verificarRol('usuario', 'admin'), crearTicket);
router.put('/:id', verificarToken, verificarRol('tecnico', 'admin'), actualizarTicket);

export default router;
