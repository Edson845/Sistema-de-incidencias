import express from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import {
  getUsuario,
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  obtenerRoles,
  eliminarUsuario
} from '../controllers/usuarios.controller.js';

const router = express.Router();

// Rutas de usuarios
// Ruta pública para registro (no requiere token) — útil para formularios de registro
router.post('/registro', crearUsuario);

// Rutas protegidas para administración/operaciones internas
// Listar todos (solo admin)
router.get('/', verificarToken, verificarRol(['admin']), getUsuarios);

// Obtener roles (público)
router.get('/roles', obtenerRoles);

// Crear usuario vía API (solo admin)
router.post('/', verificarToken, verificarRol(['admin']), crearUsuario);

// Obtener un usuario por DNI (requiere token)
router.get('/:id', verificarToken, getUsuario);

// Actualizar usuario (requiere token; permisos gestionados en verificarRol si es necesario)
router.put('/:id', verificarToken, actualizarUsuario);

// Eliminar usuario (solo admin)
router.delete('/:id', verificarToken, verificarRol(['admin']), eliminarUsuario);

export default router;
