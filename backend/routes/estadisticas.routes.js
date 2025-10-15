const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin } = require('../middlewares/auth.middleware');
import  getEstadisticas  from '../controllers/estadisticas.controller';

router.get('/', verificarToken, esAdmin, getEstadisticas);

module.exports = router;

const { getResumen, getTicketsPorEstado, getTicketsPorUsuario, getUsuariosPorRol, getEstadisticasGenerales } = require ('../controllers/estadisticas.controller.js');

router.get('/resumen', getResumen);
router.get('/tickets-por-estado', getTicketsPorEstado);
router.get('/tickets-por-usuario', getTicketsPorUsuario);
router.get('/usuarios-por-rol', getUsuariosPorRol);
router.get('/generales', getEstadisticasGenerales);

export default router;