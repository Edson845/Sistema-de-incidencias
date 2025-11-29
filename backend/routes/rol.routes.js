import express from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware.js';
import { obtenerRoles } from '../controllers/rol.controller.js';

const router = express.Router();

router.get('/',verificarToken,verificarRol(['admin']),obtenerRoles);
router.get('/roles', verificarToken, obtenerRoles);
export default router;
