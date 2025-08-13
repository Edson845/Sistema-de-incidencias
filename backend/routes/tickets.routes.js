const express = require('express');
const { verificarToken, esAdmin } = require('../middlewares/auth.middleware');
const { getTicketsUsuario, getTodosTickets, crearTicket, actualizarTicket } = require('../controllers/tickets.controller');

const router = express.Router();

router.get('/mios', verificarToken, getTicketsUsuario);
router.get('/', verificarToken, esAdmin, getTodosTickets);
router.post('/', verificarToken, crearTicket);
router.put('/:id', verificarToken, actualizarTicket);

module.exports = router;
