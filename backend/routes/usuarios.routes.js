import express from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import {
  getUsuario, getUsuarios, crearUsuario, actualizarUsuario
} from '../controllers/usuarios.controller.js';

const router = express.Router();

// Perfil individual (propio o por id si es admin)
router.get('/', verificarToken, verificarRol('admin'), getUsuarios);
router.post('/', verificarToken, verificarRol('admin'), crearUsuario);
router.get('/:id', verificarToken, getUsuario);
router.put('/:id', verificarToken, actualizarUsuario);


export default router;
