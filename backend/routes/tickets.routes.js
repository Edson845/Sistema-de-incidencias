import express from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import { 
  getTicketsUsuario, 
  getTodosTickets, 
  crearTicket, 
  actualizarTicket 
} from '../controllers/tickets.controller.js';

const router = express.Router();

// Solo tickets del usuario logueado
router.get('/mios', verificarToken, getTicketsUsuario);

// Solo administradores pueden ver todos los tickets
router.get('/', verificarToken, verificarRol('admin'), getTodosTickets);

// Cualquier usuario autenticado puede crear tickets
router.post('/', verificarToken, crearTicket);

// Actualizar ticket (puedes agregar rol si solo ciertos roles pueden actualizar)
router.put('/:id', verificarToken, actualizarTicket);

export default router;
