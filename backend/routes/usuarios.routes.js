import express from 'express';

import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import {
  obtenerUsuario,
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  actualizarAvatar,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  obtenerTecnicos
} from '../controllers/usuarios.controller.js';
import { subirAvatar } from '../middlewares/avatar.middleware.js';

const router = express.Router();

// Rutas de usuarios
// Ruta pública para registro (no requiere token) — útil para formularios de registro
router.post('/registro', crearUsuario);

// Rutas protegidas para administración/operaciones internas
// Listar todos (solo admin)
router.get('/', verificarToken, verificarRol(['admin']), obtenerUsuarios);

// Crear usuario vía API (solo admin)
router.post('/', verificarToken, verificarRol(['admin']), crearUsuario);

// Rutas de perfil (usuario autenticado)
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);
router.put('/cambiar-contrasenia', verificarToken, cambiarPassword);
router.put('/usuario/avatar/:id', verificarToken, subirAvatar.single('avatar'), actualizarAvatar);

// Obtener un usuario por DNI (requiere token)
router.get('/tecnicos', verificarToken, verificarRol(['admin']), obtenerTecnicos);
router.get('/:id', verificarToken, obtenerUsuario);

// Actualizar usuario (requiere token; permisos gestionados en verificarRol si es necesario)
router.put('/:id', verificarToken, actualizarUsuario);

// Eliminar usuario (solo admin)
router.delete('/:id', verificarToken, verificarRol(['admin']), eliminarUsuario);



export default router;
