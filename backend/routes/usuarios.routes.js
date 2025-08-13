const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin } = require('../middlewares/auth.middleware');
const {
  getUsuario, getUsuarios, crearUsuario, actualizarUsuario
} = require('../controllers/usuarios.controller');

// Perfil individual (propio o por id si es admin)
router.get('/:id', verificarToken, getUsuario);

// Sólo admin puede listar y crear
router.get('/', verificarToken, esAdmin, getUsuarios);
router.post('/', verificarToken, esAdmin, crearUsuario);

// Edición: el admin edita a cualquiera; el usuario podría editarse a sí mismo (puedes reforzar en controller)
router.put('/:id', verificarToken, actualizarUsuario);

module.exports = router;
