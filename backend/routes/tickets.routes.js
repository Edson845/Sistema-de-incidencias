import express from 'express';
import { verificarToken, esAdmin } from '../middlewares/auth.middleware.js';
import { 
  getTicketsUsuario, 
  getTodosTickets, 
  crearTicket, 
  actualizarTicket 
} from '../controllers/tickets.controller.js';

const router = express.Router();

router.get('/mios', verificarToken, getTicketsUsuario);
router.get('/', verificarToken, esAdmin, getTodosTickets);
router.post('/', verificarToken, crearTicket);
router.put('/:id', verificarToken, actualizarTicket);

export default router;
