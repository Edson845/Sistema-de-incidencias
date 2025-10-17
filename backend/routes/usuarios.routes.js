import express from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import {
  getUsuario, getUsuarios, crearUsuario, actualizarUsuario
} from '../controllers/usuarios.controller.js';

const router = express.Router();

// Perfil individual (propio o por id si es admin)
router.get('/:id', verificarToken, getUsuario);

// Sólo admin puede listar y crear
router.get('/', verificarToken, verificarRol, getUsuarios);
router.post('/', verificarToken, verificarRol, crearUsuario);

// Edición: el admin edita cualquiera; el usuario podría editarse a sí mismo
router.put('/:id', verificarToken, actualizarUsuario);

export default router;
