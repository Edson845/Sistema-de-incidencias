const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin } = require('../middlewares/auth.middleware');
const { getEstadisticas } = require('../controllers/estadisticas.controller');

router.get('/', verificarToken, esAdmin, getEstadisticas);

module.exports = router;
